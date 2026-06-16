import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  isCloudinaryConfigured = true;
  console.log('[Cloudinary] Configured successfully.');
} else {
  console.warn('[Cloudinary] Warning: Credentials missing. Uploads will be simulated locally.');
}

export { cloudinary, isCloudinaryConfigured };
