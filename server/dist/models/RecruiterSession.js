"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RecruiterSessionSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    recruiterName: { type: String, required: true, default: 'Recruiter' },
    company: { type: String, required: true, default: 'Anonymous Corp' },
    role: { type: String, required: true },
    rating: { type: Number, default: 3 },
    score: { type: Number, default: 70 },
    feedback: {
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        improvements: { type: [String], default: [] },
        suggestedLearningPaths: { type: [String], default: [] },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('RecruiterSession', RecruiterSessionSchema);
