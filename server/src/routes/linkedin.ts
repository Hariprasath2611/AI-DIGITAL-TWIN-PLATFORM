import { Router, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { generateLinkedInReport } from '../services/aiService';
import Experience from '../models/Experience';
import Skill from '../models/Skill';

const router = Router();

// POST /api/linkedin/import - Import LinkedIn parsed data structure
router.post('/import', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { profileData } = req.body;
    if (!profileData) {
      res.status(400).json({ error: 'LinkedIn profile data is required' });
      return;
    }

    const userId = req.user!.firebaseUid;
    console.log(`[LinkedIn Route] Importing profile data for user: ${userId}`);

    // Map LinkedIn experiences to Experiences Collection
    if (profileData.experiences && Array.isArray(profileData.experiences)) {
      for (const exp of profileData.experiences) {
        const existing = await Experience.findOne({ userId, company: exp.company, role: exp.role });
        if (!existing) {
          await Experience.create({
            userId,
            company: exp.company,
            role: exp.role,
            location: exp.location || 'Remote',
            startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            current: exp.current || false,
            description: exp.description || 'Imported from LinkedIn profile.',
            achievements: exp.achievements || [],
          });
        }
      }
    }

    // Map LinkedIn skills to Skills Collection
    if (profileData.skills && Array.isArray(profileData.skills)) {
      for (const skillName of profileData.skills) {
        const existing = await Skill.findOne({ userId, name: skillName });
        if (!existing) {
          await Skill.create({
            userId,
            name: skillName,
            category: 'Technical',
            proficiency: 'intermediate',
            yearsOfExperience: 1,
          });
        }
      }
    }

    // Generate Career Insights & Gap analysis via Gemini
    const reportText = await generateLinkedInReport(profileData);

    res.json({
      message: 'LinkedIn profile successfully synchronized.',
      insights: reportText,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
