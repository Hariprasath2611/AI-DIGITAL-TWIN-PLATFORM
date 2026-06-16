"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Analytics_1 = __importDefault(require("../models/Analytics"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// POST /api/analytics/view/:username - Records public portfolio profile view
router.post('/view/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const targetUser = await User_1.default.findOne({ username: username.toLowerCase() });
        if (!targetUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const userId = targetUser.firebaseUid;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        // Update analytics document
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const analyticsDoc = await Analytics_1.default.findOne({ userId });
        if (!analyticsDoc) {
            await Analytics_1.default.create({
                userId,
                views: [{ ip: clientIp, country: 'Localhost', timestamp: new Date() }],
                chatConversationsCount: 0,
                recruiterInteractionsCount: 0,
                dailyMetrics: [{ date: today, views: 1, chats: 0, interactions: 0 }],
            });
        }
        else {
            // Record view event
            analyticsDoc.views.push({
                ip: clientIp,
                country: 'Localhost',
                timestamp: new Date(),
            });
            // Update daily metrics
            const dailyIdx = analyticsDoc.dailyMetrics.findIndex(m => m.date.getTime() === today.getTime());
            if (dailyIdx !== -1) {
                analyticsDoc.dailyMetrics[dailyIdx].views += 1;
            }
            else {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/analytics - Get analytics statistics for dashboard
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        let analytics = await Analytics_1.default.findOne({ userId });
        if (!analytics) {
            // Seed dummy initial analytics data for nice charts out-of-the-box
            const today = new Date();
            today.setHours(0, 0, 0, 0);
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
            analytics = await Analytics_1.default.create({
                userId,
                chatConversationsCount: 12,
                recruiterInteractionsCount: 3,
                dailyMetrics,
            });
        }
        res.json(analytics);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
