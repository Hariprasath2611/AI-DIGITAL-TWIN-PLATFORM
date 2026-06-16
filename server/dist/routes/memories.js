"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Memory_1 = __importDefault(require("../models/Memory"));
const router = (0, express_1.Router)();
// GET /api/memories - Get all memories sorted by date descending
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const memories = await Memory_1.default.find({ userId: req.user.firebaseUid }).sort({ date: -1 });
        res.json(memories);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/memories - Create a memory
router.post('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const { title, description, category, date, tags } = req.body;
        const memory = await Memory_1.default.create({
            userId: req.user.firebaseUid,
            title,
            description,
            category,
            date,
            tags,
        });
        res.status(201).json(memory);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT /api/memories/:id - Update memory
router.put('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const memory = await Memory_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.firebaseUid }, req.body, { new: true });
        if (!memory) {
            res.status(404).json({ error: 'Memory not found' });
            return;
        }
        res.json(memory);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE /api/memories/:id - Delete memory
router.delete('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const memory = await Memory_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user.firebaseUid });
        if (!memory) {
            res.status(404).json({ error: 'Memory not found' });
            return;
        }
        res.json({ message: 'Memory deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
