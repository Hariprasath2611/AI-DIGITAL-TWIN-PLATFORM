"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CertificateSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    url: { type: String },
    credentialId: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Certificate', CertificateSchema);
