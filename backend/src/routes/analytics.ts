import { Router, Request, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import Analytics from '../models/Analytics';
import User from '../models/User';

const router = Router();

// POST /api/analytics/view/:username - Records public portfolio profile view
router.post('/view/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const targetUser = await User.findOne({ username: username.toLowerCase() });
    
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userId = targetUser.firebaseUid;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    // Update analytics document
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsDoc = await Analytics.findOne({ userId });

    if (!analyticsDoc) {
      await Analytics.create({
        userId,
        views: [{ ip: clientIp, country: 'Localhost', timestamp: new Date() }],
        chatConversationsCount: 0,
        recruiterInteractionsCount: 0,
        dailyMetrics: [{ date: today, views: 1, chats: 0, interactions: 0 }],
      });
    } else {
      // Record view event
      analyticsDoc.views.push({
        ip: clientIp,
        country: 'Localhost',
        timestamp: new Date(),
      });

      // Update daily metrics
      const dailyIdx = analyticsDoc.dailyMetrics.findIndex(
        m => m.date.getTime() === today.getTime()
      );

      if (dailyIdx !== -1) {
        analyticsDoc.dailyMetrics[dailyIdx].views += 1;
      } else {
        analyticsDoc.dailyMetrics.push({
          date: today,
          views: 1,
          chats: 0,
          interactions: 0,
        });
      }

      await analyticsDoc.save();
    }

    res.json({ message: 'View recorded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics - Get analytics statistics for dashboard
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.firebaseUid;
    let analytics = await Analytics.findOne({ userId });

    if (!analytics) {
      // Seed dummy initial analytics data for nice charts out-of-the-box
      const today = new Date();
      today.setHours(0,0,0,0);

      const dailyMetrics = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dailyMetrics.push({
          date: d,
          views: Math.floor(10 + Math.random() * 30),
          chats: Math.floor(1 + Math.random() * 8),
          interactions: Math.floor(Math.random() * 3),
        });
      }

      analytics = await Analytics.create({
        userId,
        chatConversationsCount: 12,
        recruiterInteractionsCount: 3,
        dailyMetrics,
      });
    }

    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
