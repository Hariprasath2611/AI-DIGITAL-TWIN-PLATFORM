"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFirebaseConfigured = exports.firebaseAdminApp = void 0;
const admin = __importStar(require("firebase-admin"));
let isFirebaseConfigured = false;
exports.isFirebaseConfigured = isFirebaseConfigured;
let firebaseAdminApp = null;
exports.firebaseAdminApp = firebaseAdminApp;
try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (projectId && clientEmail && privateKey) {
        // Replace literal newlines if present
        const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
        exports.firebaseAdminApp = firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: formattedPrivateKey,
            }),
        });
        exports.isFirebaseConfigured = isFirebaseConfigured = true;
        console.log('[Firebase] Admin SDK initialized successfully.');
    }
    else {
        console.warn('[Firebase] Warning: Credentials missing. Running in Auth Mock Mode.');
    }
}
catch (error) {
    console.warn('[Firebase] Error initializing Admin SDK, running in Auth Mock Mode:', error);
}
exports.default = admin;
