"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ViewEventSchema = new mongoose_1.Schema({
    ip: { type: String, required: true },
    country: { type: String, default: 'Unknown' },
    timestamp: { type: Date, default: Date.now },
});
const DailyMetricSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    chats: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
});
const AnalyticsSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    views: { type: [ViewEventSchema], default: [] },
    chatConversationsCount: { type: Number, default: 0 },
    recruiterInteractionsCount: { type: Number, default: 0 },
    dailyMetrics: { type: [DailyMetricSchema], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Analytics', AnalyticsSchema);
