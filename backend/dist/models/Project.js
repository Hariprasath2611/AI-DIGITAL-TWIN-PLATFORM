"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String },
    githubUrl: { type: String },
    technologies: { type: [String], default: [] },
    image: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    achievements: { type: [String], default: [] },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Project', ProjectSchema);
