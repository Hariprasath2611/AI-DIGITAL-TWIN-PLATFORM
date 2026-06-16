import * as admin from 'firebase-admin';

let isFirebaseConfigured = false;
let firebaseAdminApp: admin.app.App | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    // Replace literal newlines if present
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    isFirebaseConfigured = true;
    console.log('[Firebase] Admin SDK initialized successfully.');
  } else {
    console.warn('[Firebase] Warning: Credentials missing. Running in Auth Mock Mode.');
  }
} catch (error) {
  console.warn('[Firebase] Error initializing Admin SDK, running in Auth Mock Mode:', error);
}

export { firebaseAdminApp, isFirebaseConfigured };
export default admin;
