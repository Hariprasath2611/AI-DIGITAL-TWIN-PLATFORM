import { pineconeClient, indexName, isPineconeConfigured } from '../config/pinecone';
import { googleGenAI, isGeminiConfigured } from '../config/gemini';

export interface VectorRecord {
  id: string;
  userId: string;
  text: string;
  metadata: any;
  embedding?: number[];
}

// In-memory Vector Store fallback when Pinecone is not configured
const memoryVectorStore: VectorRecord[] = [];

// Helper to chunk text
export const chunkText = (text: string, chunkSize: number = 800, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks.length > 0 ? chunks : [text];
};

// Compute cosine similarity between two vectors
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Generate Embeddings using Gemini API or fallback
export const getEmbedding = async (text: string): Promise<number[]> => {
  if (isGeminiConfigured && googleGenAI) {
    try {
      const model = googleGenAI.getGenerativeModel({ model: 'text-embedding-004' });
      const response = await model.embedContent(text);
      if (response.embedding && response.embedding.values) {
        return response.embedding.values;
      }
    } catch (error) {
      console.error('[Vector Store] Gemini Embedding error, using mock:', error);
    }
  }

  // Fallback: Generate deterministic pseudo-random embedding based on string contents
  const size = 768; // text-embedding-004 outputs 768 dimensions
  const embedding = new Array(size).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    embedding[i % size] += code;
  }
  // Normalize
  const mag = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return mag === 0 ? embedding : embedding.map(v => v / mag);
};

// Upsert vectors
export const upsertVectors = async (records: VectorRecord[]): Promise<void> => {
  console.log(`[Vector Store] Upserting ${records.length} vectors...`);

  // Fill in embeddings
  for (const record of records) {
    if (!record.embedding) {
      record.embedding = await getEmbedding(record.text);
    }
  }

  if (isPineconeConfigured && pineconeClient) {
    try {
      const index = pineconeClient.Index(indexName);
      const pineconeRecords = records.map(r => ({
        id: r.id,
        values: r.embedding!,
        metadata: {
          ...r.metadata,
          userId: r.userId,
          text: r.text,
        },
      }));
      await index.upsert(pineconeRecords);
      console.log(`[Vector Store] Upserted ${records.length} records to Pinecone.`);
      return;
    } catch (error) {
      console.error('[Vector Store] Pinecone upsert failed, falling back to memory store:', error);
    }
  }

  // Fallback: Save to memory
  for (const record of records) {
    // Check if exists, replace or push
    const idx = memoryVectorStore.findIndex(r => r.id === record.id);
    if (idx !== -1) {
      memoryVectorStore[idx] = record;
    } else {
      memoryVectorStore.push(record);
    }
  }
  console.log(`[Vector Store] Saved ${records.length} records to local memory store. (Total size: ${memoryVectorStore.length})`);
};

// Query vectors
export const queryVectors = async (
  userId: string,
  queryText: string,
  topK: number = 3
): Promise<VectorRecord[]> => {
  console.log(`[Vector Store] Querying vectors for user ${userId}: "${queryText}"`);
  const queryEmbed = await getEmbedding(queryText);

  if (isPineconeConfigured && pineconeClient) {
    try {
      const index = pineconeClient.Index(indexName);
      const queryResponse = await index.query({
        vector: queryEmbed,
        topK,
        filter: { userId: { $eq: userId } },
        includeMetadata: true,
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        return queryResponse.matches.map(m => ({
          id: m.id,
          userId,
          text: (m.metadata as any)?.text || '',
          metadata: m.metadata || {},
        }));
      }
    } catch (error) {
      console.error('[Vector Store] Pinecone query failed, falling back to memory store search:', error);
    }
  }

  // Fallback: Local search in memory store
  const userVectors = memoryVectorStore.filter(r => r.userId === userId);
  if (userVectors.length === 0) {
    return [];
  }

  // Compute similarities
  const scored = userVectors.map(v => {
    const score = cosineSimilarity(queryEmbed, v.embedding || []);
    return { record: v, score };
  });

  // Sort and take topK
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.record);
};
