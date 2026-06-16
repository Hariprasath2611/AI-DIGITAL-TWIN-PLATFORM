"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const ConversationSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    context: {
        type: String,
        enum: ['personal_assistant', 'mock_recruiter', 'public_portfolio'],
        required: true,
        default: 'personal_assistant',
    },
    visitorId: { type: String },
    messages: [MessageSchema],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Conversation', ConversationSchema);
