import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Project from '../models/Project';

const router = Router();

// GET /api/projects - Get all projects for current user
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await Project.find({ userId: req.user!.firebaseUid }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects - Create a project
router.post('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, url, githubUrl, technologies, image, startDate, endDate, achievements } = req.body;
    const project = await Project.create({
      userId: req.user!.firebaseUid,
      title,
      description,
      url,
      githubUrl,
      technologies,
      image,
      startDate,
      endDate,
      achievements,
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.firebaseUid },
      req.body,
      { new: true }
    );
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.firebaseUid });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
