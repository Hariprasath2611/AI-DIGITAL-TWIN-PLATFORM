import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/auth/me - Gets currently authenticated user profile
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/sync - Syncs profile on login/signup, calculates score
router.post('/sync', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate updated profile score
    let score = 40; // Base score
    if (user.displayName) score += 10;
    if (user.photoURL) score += 5;
    if (user.writingStyleProfile?.samplePost) score += 15;

    user.profileScore = Math.min(score, 100);
    await user.save();

    res.json({ user, message: 'Profile synced successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
