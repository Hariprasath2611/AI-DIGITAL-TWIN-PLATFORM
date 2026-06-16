import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Experience from '../models/Experience';

const router = Router();

// GET /api/experiences - Get all experiences
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const experiences = await Experience.find({ userId: req.user!.firebaseUid }).sort({ startDate: -1 });
    res.json(experiences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/experiences - Create experience
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { company, role, location, startDate, endDate, current, description, achievements } = req.body;
    const experience = await Experience.create({
      userId: req.user!.firebaseUid,
      company,
      role,
      location,
      startDate,
      endDate,
      current,
      description,
      achievements,
    });
    res.status(201).json(experience);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/experiences/:id - Update experience
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const experience = await Experience.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.firebaseUid },
      req.body,
      { new: true }
    );
    if (!experience) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    res.json(experience);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/experiences/:id - Delete experience
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const experience = await Experience.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!experience) {
      res.status(404).json({ error: 'Experience not found' });
      return;
    }
    res.json({ message: 'Experience deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
