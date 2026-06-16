"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Experience_1 = __importDefault(require("../models/Experience"));
const router = (0, express_1.Router)();
// GET /api/experiences - Get all experiences
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const experiences = await Experience_1.default.find({ userId: req.user.firebaseUid }).sort({ startDate: -1 });
        res.json(experiences);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/experiences - Create experience
router.post('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const { company, role, location, startDate, endDate, current, description, achievements } = req.body;
        const experience = await Experience_1.default.create({
            userId: req.user.firebaseUid,
            company,
            role,
            location,
            startDate,
            endDate,
            current,
            description,
            achievements,
        });
        res.status(201).json(experience);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT /api/experiences/:id - Update experience
router.put('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const experience = await Experience_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.firebaseUid }, req.body, { new: true });
        if (!experience) {
            res.status(404).json({ error: 'Experience not found' });
            return;
        }
        res.json(experience);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE /api/experiences/:id - Delete experience
router.delete('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const experience = await Experience_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user.firebaseUid });
        if (!experience) {
            res.status(404).json({ error: 'Experience not found' });
            return;
        }
        res.json({ message: 'Experience deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
