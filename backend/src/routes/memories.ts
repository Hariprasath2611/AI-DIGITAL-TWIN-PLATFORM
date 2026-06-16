import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Memory from '../models/Memory';

const router = Router();

// GET /api/memories - Get all memories sorted by date descending
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memories = await Memory.find({ userId: req.user!.firebaseUid }).sort({ date: -1 });
    res.json(memories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/memories - Create a memory
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, date, tags } = req.body;
    const memory = await Memory.create({
      userId: req.user!.firebaseUid,
      title,
      description,
      category,
      date,
      tags,
    });
    res.status(201).json(memory);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/memories/:id - Update memory
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.firebaseUid },
      req.body,
      { new: true }
    );
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json(memory);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/memories/:id - Delete memory
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!memory) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json({ message: 'Memory deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
