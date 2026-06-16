"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-digital-twin';
        console.log(`[Database] Connecting to: ${connUri}`);
        await mongoose_1.default.connect(connUri);
        console.log('[Database] MongoDB Connected successfully.');
    }
    catch (error) {
        console.error('[Database] Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
