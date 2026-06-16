"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SkillSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
    yearsOfExperience: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Skill', SkillSchema);
