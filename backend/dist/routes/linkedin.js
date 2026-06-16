"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const aiService_1 = require("../services/aiService");
const Experience_1 = __importDefault(require("../models/Experience"));
const Skill_1 = __importDefault(require("../models/Skill"));
const router = (0, express_1.Router)();
// POST /api/linkedin/import - Import LinkedIn parsed data structure
router.post('/import', auth_1.authenticateUser, async (req, res) => {
    try {
        const { profileData } = req.body;
        if (!profileData) {
            res.status(400).json({ error: 'LinkedIn profile data is required' });
            return;
        }
        const userId = req.user.firebaseUid;
        console.log(`[LinkedIn Route] Importing profile data for user: ${userId}`);
        // Map LinkedIn experiences to Experiences Collection
        if (profileData.experiences && Array.isArray(profileData.experiences)) {
            for (const exp of profileData.experiences) {
                const existing = await Experience_1.default.findOne({ userId, company: exp.company, role: exp.role });
                if (!existing) {
                    await Experience_1.default.create({
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
                const existing = await Skill_1.default.findOne({ userId, name: skillName });
                if (!existing) {
                    await Skill_1.default.create({
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
        const reportText = await (0, aiService_1.generateLinkedInReport)(profileData);
        res.json({
            message: 'LinkedIn profile successfully synchronized.',
            insights: reportText,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
