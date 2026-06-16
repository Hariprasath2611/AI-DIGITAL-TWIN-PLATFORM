"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ExperienceSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
    achievements: { type: [String], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Experience', ExperienceSchema);
