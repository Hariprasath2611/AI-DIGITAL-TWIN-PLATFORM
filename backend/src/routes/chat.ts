import { Router, Request, Response } from 'express';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';
import { queryVectors } from '../services/vectorStore';
import { generateChatResponse, generateBrandContent, generateMockRecruiterFeedback } from '../services/aiService';
import Conversation from '../models/Conversation';
import User from '../models/User';
import RecruiterSession from '../models/RecruiterSession';
import Analytics from '../models/Analytics';

const router = Router();

// POST /api/chat/assistant - Chat with personal assistant (Dashboard)
router.post('/assistant', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.firebaseUid;
    const { message, conversationId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Retrieve last few messages for context
    let conversation = conversationId 
      ? await Conversation.findOne({ _id: conversationId, userId }) 
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
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
    const relatedDocs = await queryVectors(userId, message, 3);
    const contextTexts = relatedDocs.map(d => d.text);

    // Get response from Gemini
    const aiText = await generateChatResponse(
      userId,
      conversation.messages.map(m => ({ sender: m.sender, text: m.text })),
      contextTexts
    );

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chat/visitor/:username - Public portfolio AI Chat widget
router.post('/visitor/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { message, visitorId, conversationId } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Find the profile user
    const targetUser = await User.findOne({ username: username.toLowerCase() });
    if (!targetUser) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const userId = targetUser.firebaseUid;

    let conversation = conversationId
      ? await Conversation.findOne({ _id: conversationId, userId, context: 'public_portfolio' })
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        context: 'public_portfolio',
        visitorId: visitorId || 'anonymous-visitor',
        messages: [],
      });

      // Update analytics
      await Analytics.findOneAndUpdate(
        { userId },
        { $inc: { chatConversationsCount: 1 } },
        { upsert: true }
      );
    }

    // Add visitor message
    conversation.messages.push({
      sender: 'user',
      text: message,
      timestamp: new Date(),
    });

    // Query relevant knowledge base vectors
    const relatedDocs = await queryVectors(userId, message, 3);
    const contextTexts = relatedDocs.map(d => d.text);

    // Get response from Gemini
    const aiText = await generateChatResponse(
      userId,
      conversation.messages.map(m => ({ sender: m.sender, text: m.text })),
      contextTexts
    );

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chat/brand - Personal Brand Content generation
router.post('/brand', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.firebaseUid;
    const { type, prompt } = req.body; // type: linkedin, twitter, bio, resume_improvement

    if (!type || !prompt) {
      res.status(400).json({ error: 'Type and prompt are required' });
      return;
    }

    const generatedContent = await generateBrandContent(userId, type, prompt);
    res.json({ content: generatedContent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chat/recruiter/evaluate - Review and evaluate mock recruiter session
router.post('/recruiter/evaluate', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.firebaseUid;
    const { role, messages } = req.body;

    if (!role || !messages || messages.length === 0) {
      res.status(400).json({ error: 'Role and conversation messages are required' });
      return;
    }

    // Run review using Gemini
    const evaluation = await generateMockRecruiterFeedback(role, messages);

    // Save session in db
    const session = await RecruiterSession.create({
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
    await Analytics.findOneAndUpdate(
      { userId },
      { $inc: { recruiterInteractionsCount: 1 } },
      { upsert: true }
    );

    res.status(201).json({
      session,
      overallFeedback: evaluation.transcriptFeedback,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chat/recruiter/sessions - Get past recruiter sessions
router.get('/recruiter/sessions', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await RecruiterSession.find({ userId: req.user!.firebaseUid }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
