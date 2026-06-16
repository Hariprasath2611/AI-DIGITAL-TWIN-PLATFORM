"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DocumentSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['resume', 'portfolio', 'certificate', 'project_doc', 'note', 'blog'],
        required: true,
    },
    fileUrl: { type: String },
    cloudinaryId: { type: String },
    contentText: { type: String, required: true, default: '' },
    embeddingsIndexed: { type: Boolean, default: false },
    category: { type: String, default: 'General' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Document', DocumentSchema);
