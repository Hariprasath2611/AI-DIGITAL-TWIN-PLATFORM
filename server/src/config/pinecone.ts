import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;
let isPineconeConfigured = false;

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || 'ai-digital-twin';

if (apiKey) {
  try {
    pineconeClient = new Pinecone({
      apiKey,
    });
    isPineconeConfigured = true;
    console.log(`[Pinecone] Initialized. Target Index: ${indexName}`);
  } catch (error) {
    console.error('[Pinecone] Initialization Error:', error);
  }
} else {
  console.warn('[Pinecone] Warning: API Key missing. Running in Vector Mock Mode (local memory store).');
}

export { pineconeClient, indexName, isPineconeConfigured };
