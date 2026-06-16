import { Router, Request, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import User from '../models/User';
import Project from '../models/Project';
import Skill from '../models/Skill';
import Experience from '../models/Experience';
import Memory from '../models/Memory';
import Certificate from '../models/Certificate';
import { learnWritingStyle } from '../services/styleLearningService';

const router = Router();

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { displayName, photoURL, writingStyleProfile } = req.body;

    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    if (writingStyleProfile) {
      user.writingStyleProfile = {
        ...user.writingStyleProfile,
        ...writingStyleProfile
      };
    }

    await user.save();
    res.json({ user, message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/analyze-style - Analyze user writings and save style profile
router.post('/analyze-style', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const styleProfile = await learnWritingStyle(user.firebaseUid);

    user.writingStyleProfile = {
      tone: styleProfile.tone,
      vocabulary: styleProfile.vocabulary,
      patterns: styleProfile.patterns,
      samplePost: styleProfile.samplePost,
    };

    user.profileScore = Math.min(user.profileScore + 20, 100);
    await user.save();

    res.json({
      message: 'AI Writing style analysis completed successfully.',
      writingStyleProfile: user.writingStyleProfile,
      profileScore: user.profileScore,
      stylometrics: styleProfile.stylometrics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/username/:username - Public portfolio aggregator
router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Aggregate public data
    const projects = await Project.find({ userId: user.firebaseUid }).sort({ createdAt: -1 });
    const skills = await Skill.find({ userId: user.firebaseUid });
    const experiences = await Experience.find({ userId: user.firebaseUid }).sort({ startDate: -1 });
    const certificates = await Certificate.find({ userId: user.firebaseUid }).sort({ issueDate: -1 });
    const memories = await Memory.find({ userId: user.firebaseUid }).sort({ date: -1 });

    res.json({
      user: {
        firebaseUid: user.firebaseUid,
        username: user.username,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        profileScore: user.profileScore,
        writingStyleProfile: user.writingStyleProfile,
      },
      projects,
      skills,
      experiences,
      certificates,
      memories
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
