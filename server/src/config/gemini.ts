import { GoogleGenAI } from '@google/genai';

let googleGenAI: GoogleGenAI | null = null;
let isGeminiConfigured = false;

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    googleGenAI = new GoogleGenAI({ apiKey });
    isGeminiConfigured = true;
    console.log('[Gemini API] Client initialized successfully.');
  } catch (error) {
    console.error('[Gemini API] Initialization Error:', error);
  }
} else {
  console.warn('[Gemini API] Warning: API Key missing. Running in AI Mock Mode.');
}

export { googleGenAI, isGeminiConfigured };
