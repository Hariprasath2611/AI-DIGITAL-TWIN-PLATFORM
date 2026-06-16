"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.learnWritingStyle = exports.analyzeStylometrics = void 0;
const aiService_1 = require("./aiService");
const Document_1 = __importDefault(require("../models/Document"));
// Simple stop words list to filter vocabulary frequencies
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'to', 'for', 'in', 'on', 'at', 'by',
    'with', 'from', 'about', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'of', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
    'do', 'does', 'did', 'doing', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'me', 'him', 'them', 'us',
    'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must', 'just', 'more',
    'some', 'any', 'both', 'each', 'few', 'other', 'own', 'so', 'than', 'too', 'very', 's', 't',
    'can', 'will', 'just', 'should'
]);
/**
 * Clean text and tokenize into words
 */
const tokenize = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
};
/**
 * Local statistical NLP to extract vocabulary frequencies and sentence counts
 */
const analyzeStylometrics = (text) => {
    const words = tokenize(text);
    const totalWords = words.length;
    // 1. Calculate Term Frequencies
    const freqMap = {};
    words.forEach(word => {
        if (!STOP_WORDS.has(word)) {
            freqMap[word] = (freqMap[word] || 0) + 1;
        }
    });
    // Sort by frequency
    const sortedVocab = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
    // 2. Sentence metrics
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentenceCount > 0 ? Math.round(totalWords / sentenceCount) : 0;
    // 3. Punctuation densities
    const questionCount = (text.match(/\?/g) || []).length;
    const exclamationCount = (text.match(/!/g) || []).length;
    const bulletCount = (text.match(/^(\s*[-*+•]|\s*\d+\.)/gm) || []).length;
    return {
        vocabulary: sortedVocab,
        stylometrics: {
            avgSentenceLength,
            questionDensity: sentenceCount > 0 ? parseFloat((questionCount / sentenceCount).toFixed(3)) : 0,
            exclamationDensity: sentenceCount > 0 ? parseFloat((exclamationCount / sentenceCount).toFixed(3)) : 0,
            bulletPointFrequency: sentenceCount > 0 ? parseFloat((bulletCount / sentenceCount).toFixed(3)) : 0,
        }
    };
};
exports.analyzeStylometrics = analyzeStylometrics;
/**
 * Merges local statistics with LLM pattern extraction for writing style profiling
 */
const learnWritingStyle = async (userId) => {
    console.log(`[ML Engine] Running writing style learning for user: ${userId}`);
    // Fetch all user notes and blog posts
    const docs = await Document_1.default.find({
        userId,
        type: { $in: ['note', 'blog', 'resume'] }
    });
    if (docs.length === 0) {
        throw new Error('No user documents, notes, or blog posts found to learn writing style. Upload items first.');
    }
    // Aggregate document contents
    const combinedText = docs.map(d => d.contentText).join('\n\n');
    // 1. Run local statistical stylometric analyzer
    const localAnalysis = (0, exports.analyzeStylometrics)(combinedText);
    // 2. Call Gemini to perform a deep stylometric semantic review
    const prompt = `Analyze the writing style, tone, and grammar patterns in the following sample writings:
  
---
${combinedText.slice(0, 8000)}
---

Provide a stylized profile. You MUST respond with a valid JSON block containing:
{
  "tone": "Describe the tone (e.g. conversational, analytical, energetic, academic)",
  "patterns": ["List 3 specific sentence structure patterns or layout habits"],
  "samplePost": "Write a short 3-sentence sample LinkedIn post about modern architecture that perfectly matches this writing style"
}`;
    const aiResponse = await (0, aiService_1.askGemini)(prompt, "You are a professional computational linguist and writing style assessor.");
    let tone = 'Professional, informative, and engaging';
    let patterns = ['Starts with a hook', 'Uses bullet points for readability', 'Ends with a question'];
    let samplePost = '';
    try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            tone = parsed.tone || tone;
            patterns = parsed.patterns || patterns;
            samplePost = parsed.samplePost || samplePost;
        }
        else {
            const parsed = JSON.parse(aiResponse);
            tone = parsed.tone || tone;
            patterns = parsed.patterns || patterns;
            samplePost = parsed.samplePost || samplePost;
        }
    }
    catch (e) {
        console.warn('[ML Engine] LLM style JSON parse failed, falling back to default styling patterns:', e);
    }
    return {
        tone,
        vocabulary: localAnalysis.vocabulary,
        patterns,
        samplePost,
        stylometrics: localAnalysis.stylometrics
    };
};
exports.learnWritingStyle = learnWritingStyle;
