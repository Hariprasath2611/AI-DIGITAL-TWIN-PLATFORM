"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
const Skill_1 = __importDefault(require("../models/Skill"));
const Experience_1 = __importDefault(require("../models/Experience"));
const Memory_1 = __importDefault(require("../models/Memory"));
const Certificate_1 = __importDefault(require("../models/Certificate"));
const styleLearningService_1 = require("../services/styleLearningService");
const router = (0, express_1.Router)();
// PUT /api/users/profile - Update current user profile
router.put('/profile', auth_1.authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { displayName, photoURL, writingStyleProfile } = req.body;
        if (displayName)
            user.displayName = displayName;
        if (photoURL)
            user.photoURL = photoURL;
        if (writingStyleProfile) {
            user.writingStyleProfile = {
                ...user.writingStyleProfile,
                ...writingStyleProfile
            };
        }
        await user.save();
        res.json({ user, message: 'Profile updated successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/users/analyze-style - Analyze user writings and save style profile
router.post('/analyze-style', auth_1.authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const styleProfile = await (0, styleLearningService_1.learnWritingStyle)(user.firebaseUid);
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/users/username/:username - Public portfolio aggregator
router.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User_1.default.findOne({ username: username.toLowerCase() });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Aggregate public data
        const projects = await Project_1.default.find({ userId: user.firebaseUid }).sort({ createdAt: -1 });
        const skills = await Skill_1.default.find({ userId: user.firebaseUid });
        const experiences = await Experience_1.default.find({ userId: user.firebaseUid }).sort({ startDate: -1 });
        const certificates = await Certificate_1.default.find({ userId: user.firebaseUid }).sort({ issueDate: -1 });
        const memories = await Memory_1.default.find({ userId: user.firebaseUid }).sort({ date: -1 });
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
