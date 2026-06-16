"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Project_1 = __importDefault(require("../models/Project"));
const router = (0, express_1.Router)();
// GET /api/projects - Get all projects for current user
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const projects = await Project_1.default.find({ userId: req.user.firebaseUid }).sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/projects - Create a project
router.post('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const { title, description, url, githubUrl, technologies, image, startDate, endDate, achievements } = req.body;
        const project = await Project_1.default.create({
            userId: req.user.firebaseUid,
            title,
            description,
            url,
            githubUrl,
            technologies,
            image,
            startDate,
            endDate,
            achievements,
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT /api/projects/:id - Update a project
router.put('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const project = await Project_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.firebaseUid }, req.body, { new: true });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json(project);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE /api/projects/:id - Delete a project
router.delete('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const project = await Project_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user.firebaseUid });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
