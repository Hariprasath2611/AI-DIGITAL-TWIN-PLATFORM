"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const vectorStore_1 = require("../services/vectorStore");
const aiService_1 = require("../services/aiService");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = __importDefault(require("../models/User"));
const RecruiterSession_1 = __importDefault(require("../models/RecruiterSession"));
const Analytics_1 = __importDefault(require("../models/Analytics"));
const router = (0, express_1.Router)();
// POST /api/chat/assistant - Chat with personal assistant (Dashboard)
router.post('/assistant', auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const { message, conversationId } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        // Retrieve last few messages for context
        let conversation = conversationId
            ? await Conversation_1.default.findOne({ _id: conversationId, userId })
            : null;
        if (!conversation) {
            conversation = await Conversation_1.default.create({
                userId,
                context: 'personal_assistant',
                messages: [],
            });
        }
        // Add user message
        conversation.messages.push({
            sender: 'user',
            text: message,
            timestamp: new Date(),
        });
        // Query relevant knowledge base vectors
        const relatedDocs = await (0, vectorStore_1.queryVectors)(userId, message, 3);
        const contextTexts = relatedDocs.map(d => d.text);
        // Get response from Gemini
        const aiText = await (0, aiService_1.generateChatResponse)(userId, conversation.messages.map(m => ({ sender: m.sender, text: m.text })), contextTexts);
        // Save AI message
        conversation.messages.push({
            sender: 'ai',
            text: aiText,
            timestamp: new Date(),
        });
        await conversation.save();
        res.json({
            reply: aiText,
            conversationId: conversation._id,
            conversation,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/chat/visitor/:username - Public portfolio AI Chat widget
router.post('/visitor/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { message, visitorId, conversationId } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        // Find the profile user
        const targetUser = await User_1.default.findOne({ username: username.toLowerCase() });
        if (!targetUser) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        const userId = targetUser.firebaseUid;
        let conversation = conversationId
            ? await Conversation_1.default.findOne({ _id: conversationId, userId, context: 'public_portfolio' })
            : null;
        if (!conversation) {
            conversation = await Conversation_1.default.create({
                userId,
                context: 'public_portfolio',
                visitorId: visitorId || 'anonymous-visitor',
                messages: [],
            });
            // Update analytics
            await Analytics_1.default.findOneAndUpdate({ userId }, { $inc: { chatConversationsCount: 1 } }, { upsert: true });
        }
        // Add visitor message
        conversation.messages.push({
            sender: 'user',
            text: message,
            timestamp: new Date(),
        });
        // Query relevant knowledge base vectors
        const relatedDocs = await (0, vectorStore_1.queryVectors)(userId, message, 3);
        const contextTexts = relatedDocs.map(d => d.text);
        // Get response from Gemini
        const aiText = await (0, aiService_1.generateChatResponse)(userId, conversation.messages.map(m => ({ sender: m.sender, text: m.text })), contextTexts);
        // Save AI message
        conversation.messages.push({
            sender: 'ai',
            text: aiText,
            timestamp: new Date(),
        });
        await conversation.save();
        res.json({
            reply: aiText,
            conversationId: conversation._id,
            conversation,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/chat/brand - Personal Brand Content generation
router.post('/brand', auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const { type, prompt } = req.body; // type: linkedin, twitter, bio, resume_improvement
        if (!type || !prompt) {
            res.status(400).json({ error: 'Type and prompt are required' });
            return;
        }
        const generatedContent = await (0, aiService_1.generateBrandContent)(userId, type, prompt);
        res.json({ content: generatedContent });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/chat/recruiter/evaluate - Review and evaluate mock recruiter session
router.post('/recruiter/evaluate', auth_1.authenticateUser, async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const { role, messages } = req.body;
        if (!role || !messages || messages.length === 0) {
            res.status(400).json({ error: 'Role and conversation messages are required' });
            return;
        }
        // Run review using Gemini
        const evaluation = await (0, aiService_1.generateMockRecruiterFeedback)(role, messages);
        // Save session in db
        const session = await RecruiterSession_1.default.create({
            userId,
            recruiterName: 'AI Technical Lead',
            company: 'Digital Twin Labs',
            role,
            rating: evaluation.rating,
            score: evaluation.score,
            feedback: {
                strengths: evaluation.strengths,
                weaknesses: evaluation.weaknesses,
                improvements: evaluation.improvements,
                suggestedLearningPaths: evaluation.suggestedLearningPaths,
            },
        });
        // Update analytics recruiter interactions count
        await Analytics_1.default.findOneAndUpdate({ userId }, { $inc: { recruiterInteractionsCount: 1 } }, { upsert: true });
        res.status(201).json({
            session,
            overallFeedback: evaluation.transcriptFeedback,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/chat/recruiter/sessions - Get past recruiter sessions
router.get('/recruiter/sessions', auth_1.authenticateUser, async (req, res) => {
    try {
        const sessions = await RecruiterSession_1.default.find({ userId: req.user.firebaseUid }).sort({ createdAt: -1 });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
