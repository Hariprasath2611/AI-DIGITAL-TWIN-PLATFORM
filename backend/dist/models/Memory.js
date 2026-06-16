"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MemorySchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['achievement', 'milestone', 'learning', 'project', 'career_event'],
        required: true,
    },
    date: { type: Date, required: true },
    tags: { type: [String], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Memory', MemorySchema);
