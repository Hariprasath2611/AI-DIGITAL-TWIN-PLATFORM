"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['view', 'recommendation', 'message', 'reminder'],
        required: true,
    },
    read: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Notification', NotificationSchema);
