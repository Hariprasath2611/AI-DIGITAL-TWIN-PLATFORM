"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true, index: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
    profileScore: { type: Number, default: 0 },
    writingStyleProfile: {
        tone: { type: String, default: 'Professional, informative, and engaging' },
        vocabulary: { type: [String], default: ['efficient', 'scalable', 'modern', 'solution', 'optimize'] },
        patterns: { type: [String], default: ['Starts with a hook', 'Uses bullet points for readability', 'Ends with a question'] },
        samplePost: { type: String }
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', UserSchema);
