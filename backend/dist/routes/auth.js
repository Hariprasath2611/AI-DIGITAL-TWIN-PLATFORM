"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/auth/me - Gets currently authenticated user profile
router.get('/me', auth_1.authenticateUser, async (req, res) => {
    try {
        res.json({ user: req.user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/sync - Syncs profile on login/signup, calculates score
router.post('/sync', auth_1.authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Calculate updated profile score
        let score = 40; // Base score
        if (user.displayName)
            score += 10;
        if (user.photoURL)
            score += 5;
        if (user.writingStyleProfile?.samplePost)
            score += 15;
        user.profileScore = Math.min(score, 100);
        await user.save();
        res.json({ user, message: 'Profile synced successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
