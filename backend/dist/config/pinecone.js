"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPineconeConfigured = exports.indexName = exports.pineconeClient = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
let pineconeClient = null;
exports.pineconeClient = pineconeClient;
let isPineconeConfigured = false;
exports.isPineconeConfigured = isPineconeConfigured;
const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX_NAME || 'ai-digital-twin';
exports.indexName = indexName;
if (apiKey) {
    try {
        exports.pineconeClient = pineconeClient = new pinecone_1.Pinecone({
            apiKey,
        });
        exports.isPineconeConfigured = isPineconeConfigured = true;
        console.log(`[Pinecone] Initialized. Target Index: ${indexName}`);
    }
    catch (error) {
        console.error('[Pinecone] Initialization Error:', error);
    }
}
else {
    console.warn('[Pinecone] Warning: API Key missing. Running in Vector Mock Mode (local memory store).');
}
