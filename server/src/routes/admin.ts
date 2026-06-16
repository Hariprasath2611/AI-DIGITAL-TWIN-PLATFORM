import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import User from '../models/User';
import DocumentModel from '../models/Document';
import RecruiterSession from '../models/RecruiterSession';

const router = Router();

// GET /api/admin/stats - Retrieve system stats for admin dashboard
router.get('/stats', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const recruiterUsers = await User.countDocuments({ role: 'recruiter' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const standardUsers = await User.countDocuments({ role: 'user' });

    const totalUploads = await DocumentModel.countDocuments();
    const recruiterInteractions = await RecruiterSession.countDocuments();

    // Mock API Usage and Revenue for SaaS metrics
    const apiUsage = 1432; 
    const revenue = 450.00; // Simulated active tier subscriptions

    res.json({
      totalUsers,
      roles: {
        user: standardUsers,
        recruiter: recruiterUsers,
        admin: adminUsers,
      },
      totalUploads,
      recruiterInteractions,
      apiUsage,
      revenue,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - List all users in system
router.get('/users', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/uploads - List all uploaded documents
router.get('/uploads', authenticateUser, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uploads = await DocumentModel.find({}).populate('userId', 'displayName email').sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
