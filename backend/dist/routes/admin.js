"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const User_1 = __importDefault(require("../models/User"));
const Document_1 = __importDefault(require("../models/Document"));
const RecruiterSession_1 = __importDefault(require("../models/RecruiterSession"));
const router = (0, express_1.Router)();
// GET /api/admin/stats - Retrieve system stats for admin dashboard
router.get('/stats', auth_1.authenticateUser, roles_1.requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const recruiterUsers = await User_1.default.countDocuments({ role: 'recruiter' });
        const adminUsers = await User_1.default.countDocuments({ role: 'admin' });
        const standardUsers = await User_1.default.countDocuments({ role: 'user' });
        const totalUploads = await Document_1.default.countDocuments();
        const recruiterInteractions = await RecruiterSession_1.default.countDocuments();
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/admin/users - List all users in system
router.get('/users', auth_1.authenticateUser, roles_1.requireAdmin, async (req, res) => {
    try {
        const users = await User_1.default.find({}).sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/admin/uploads - List all uploaded documents
router.get('/uploads', auth_1.authenticateUser, roles_1.requireAdmin, async (req, res) => {
    try {
        const uploads = await Document_1.default.find({}).populate('userId', 'displayName email').sort({ createdAt: -1 });
        res.json(uploads);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
