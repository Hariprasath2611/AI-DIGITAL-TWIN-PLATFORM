"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGeminiConfigured = exports.googleGenAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
let googleGenAI = null;
exports.googleGenAI = googleGenAI;
let isGeminiConfigured = false;
exports.isGeminiConfigured = isGeminiConfigured;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey) {
    try {
        exports.googleGenAI = googleGenAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        exports.isGeminiConfigured = isGeminiConfigured = true;
        console.log('[Gemini API] Client initialized successfully.');
    }
    catch (error) {
        console.error('[Gemini API] Initialization Error:', error);
    }
}
else {
    console.warn('[Gemini API] Warning: API Key missing. Running in AI Mock Mode.');
}
