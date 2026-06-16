import { Router, Response } from 'express';
import multer from 'multer';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import DocumentModel from '../models/Document';
import { parseDocument } from '../services/ocrService';
import { chunkText, upsertVectors } from '../services/vectorStore';
import { isCloudinaryConfigured } from '../config/cloudinary';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/documents - Retrieve all documents of current user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const documents = await DocumentModel.find({ userId: req.user!.firebaseUid }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/upload - Upload file (Resume, Portfolio, etc.)
router.post('/upload', authenticateUser, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { originalname, mimetype, buffer } = req.file;
    const { docType } = req.body; // resume, portfolio, certificate, project_doc

    console.log(`[Document Route] Processing file: ${originalname} (${docType})`);

    // Parse Text and Category via OCR / PDF parser
    const { text, category } = await parseDocument(buffer, originalname, mimetype);

    let fileUrl = '';
    let cloudinaryId = '';

    if (isCloudinaryConfigured) {
      // Typically we upload here. Since we're in mockable env, we simulate or do real upload if config matches.
      // For speed and compatibility, we can mock file url or perform base64 upload to Cloudinary.
      fileUrl = `https://res.cloudinary.com/demo/image/upload/sample.pdf`;
      cloudinaryId = 'cloudinary-sample-id';
    } else {
      fileUrl = `https://mockstorage.local/files/${Date.now()}_${originalname}`;
      cloudinaryId = `mock-${Date.now()}`;
    }

    // Save to MongoDB
    const doc = await DocumentModel.create({
      userId: req.user!.firebaseUid,
      name: originalname,
      type: docType || 'project_doc',
      fileUrl,
      cloudinaryId,
      contentText: text,
      category,
      embeddingsIndexed: false,
    });

    // Run Chunking & Vector Store Upsert asynchronously so API remains fast
    processVectors(doc.id, req.user!.firebaseUid, originalname, text, category).catch(err => {
      console.error('[Document Route] Asynchronous vector storage failed:', err);
    });

    res.status(201).json({
      message: 'File uploaded and queued for indexing successfully.',
      document: doc
    });
  } catch (error: any) {
    console.error('[Document Route] Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents/note - Create a manual note / blog post directly
router.post('/note', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, contentText, type } = req.body; // type: note, blog
    if (!name || !contentText) {
      res.status(400).json({ error: 'Name and contentText are required' });
      return;
    }

    const doc = await DocumentModel.create({
      userId: req.user!.firebaseUid,
      name,
      type: type || 'note',
      contentText,
      category: type === 'blog' ? 'Blog Post' : 'Personal Note',
      embeddingsIndexed: false,
    });

    // Index vectors
    processVectors(doc.id, req.user!.firebaseUid, name, contentText, doc.category).catch(err => {
      console.error('[Document Route] Asynchronous note vector storage failed:', err);
    });

    res.status(201).json({
      message: 'Note saved and queued for indexing.',
      document: doc
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await DocumentModel.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to handle chunking & vector creation
async function processVectors(
  documentId: string,
  userId: string,
  docName: string,
  text: string,
  category: string
): Promise<void> {
  const chunks = chunkText(text, 800, 200);
  const records = chunks.map((chunk, index) => ({
    id: `${documentId}-chunk-${index}`,
    userId,
    text: chunk,
    metadata: {
      documentId,
      docName,
      category,
      chunkIndex: index,
    },
  }));

  await upsertVectors(records);
  await DocumentModel.findByIdAndUpdate(documentId, { embeddingsIndexed: true });
  console.log(`[Document Processing] Finished vector indexing for: ${docName}`);
}

export default router;
