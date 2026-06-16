"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Certificate_1 = __importDefault(require("../models/Certificate"));
const router = (0, express_1.Router)();
// GET /api/certificates - Get all certificates
router.get('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const certificates = await Certificate_1.default.find({ userId: req.user.firebaseUid }).sort({ issueDate: -1 });
        res.json(certificates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/certificates - Create certificate
router.post('/', auth_1.authenticateUser, async (req, res) => {
    try {
        const { name, issuer, issueDate, expiryDate, url, credentialId } = req.body;
        const certificate = await Certificate_1.default.create({
            userId: req.user.firebaseUid,
            name,
            issuer,
            issueDate,
            expiryDate,
            url,
            credentialId,
        });
        res.status(201).json(certificate);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT /api/certificates/:id - Update certificate
router.put('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const certificate = await Certificate_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user.firebaseUid }, req.body, { new: true });
        if (!certificate) {
            res.status(404).json({ error: 'Certificate not found' });
            return;
        }
        res.json(certificate);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE /api/certificates/:id - Delete certificate
router.delete('/:id', auth_1.authenticateUser, async (req, res) => {
    try {
        const certificate = await Certificate_1.default.findOneAndDelete({ _id: req.params.id, userId: req.user.firebaseUid });
        if (!certificate) {
            res.status(404).json({ error: 'Certificate not found' });
            return;
        }
        res.json({ message: 'Certificate deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
