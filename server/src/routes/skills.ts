import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Skill from '../models/Skill';

const router = Router();

// GET /api/skills - Get all skills for current user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const skills = await Skill.find({ userId: req.user!.firebaseUid });
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/skills - Create/Add a skill
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    const skill = await Skill.create({
      userId: req.user!.firebaseUid,
      name,
      category,
      proficiency,
      yearsOfExperience,
    });
    res.status(201).json(skill);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/skills/:id - Update skill
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const skill = await Skill.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.firebaseUid },
      req.body,
      { new: true }
    );
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json(skill);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/skills/:id - Delete skill
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!skill) {
      res.status(404).json({ error: 'Skill not found' });
      return;
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
