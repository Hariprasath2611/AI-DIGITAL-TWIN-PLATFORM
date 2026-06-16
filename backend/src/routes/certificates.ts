import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Certificate from '../models/Certificate';

const router = Router();

// GET /api/certificates - Get all certificates
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certificates = await Certificate.find({ userId: req.user!.firebaseUid }).sort({ issueDate: -1 });
    res.json(certificates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/certificates - Create certificate
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, issuer, issueDate, expiryDate, url, credentialId } = req.body;
    const certificate = await Certificate.create({
      userId: req.user!.firebaseUid,
      name,
      issuer,
      issueDate,
      expiryDate,
      url,
      credentialId,
    });
    res.status(201).json(certificate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/certificates/:id - Update certificate
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certificate = await Certificate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.firebaseUid },
      req.body,
      { new: true }
    );
    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }
    res.json(certificate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/certificates/:id - Delete certificate
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const certificate = await Certificate.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
