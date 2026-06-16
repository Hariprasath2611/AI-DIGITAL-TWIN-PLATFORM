"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCloudinaryConfigured = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
let isCloudinaryConfigured = false;
exports.isCloudinaryConfigured = isCloudinaryConfigured;
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
if (cloudName && apiKey && apiSecret) {
    cloudinary_1.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    });
    exports.isCloudinaryConfigured = isCloudinaryConfigured = true;
    console.log('[Cloudinary] Configured successfully.');
}
else {
    console.warn('[Cloudinary] Warning: Credentials missing. Uploads will be simulated locally.');
}
