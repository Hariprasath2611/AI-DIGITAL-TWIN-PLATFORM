"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Skill_1 = __importDefault(require("../models/Skill"));
const router = (0, express_1.Router)();
// GET /api/skills - Get all skills for current user
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const skills = await Skill_1.default.find({ userId: req.user.firebaseUid });
        res.json(skills);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/skills - Create/Add a skill
router.post('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const { name, category, proficiency, yearsOfExperience } = req.body;
        const skill = await Skill_1.default.create({
            userId: req.user.firebaseUid,
            name,
            category,
            proficiency,
            yearsOfExperience,
        });
        res.status(201).json(skill);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT /api/skills/:id - Update skill
router.put('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const skill = await Skill_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.firebaseUid }, req.body, { new: true });
        if (!skill) {
            res.status(404).json({ error: 'Skill not found' });
            return;
        }
        res.json(skill);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE /api/skills/:id - Delete skill
router.delete('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const skill = await Skill_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user.firebaseUid });
        if (!skill) {
            res.status(404).json({ error: 'Skill not found' });
            return;
        }
        res.json({ message: 'Skill deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
