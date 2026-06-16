import { Request, Response, NextFunction } from 'express';
import { firebaseAdminApp, isFirebaseConfigured } from '../config/firebase';
import User, { IUser } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    let firebaseUid: string;
    let email: string;
    let displayName: string;
    let photoURL: string = '';

    if (isFirebaseConfigured && firebaseAdminApp && !token.startsWith('mock-')) {
      // Real Firebase Verification
      const decodedToken = await firebaseAdminApp.auth().verifyIdToken(token);
      firebaseUid = decodedToken.uid;
      email = decodedToken.email || '';
      displayName = decodedToken.name || email.split('@')[0];
      photoURL = decodedToken.picture || '';
    } else {
      // Mock Authentication Mode (for local development/testing)
      console.log(`[Auth] Mock authentication using token: ${token}`);
      // Expected mock tokens: mock-uid-user, mock-uid-recruiter, mock-uid-admin
      const parts = token.split('-');
      const roleSuffix = parts[2] || 'user';
      firebaseUid = token;
      email = `${roleSuffix}@example.com`;
      displayName = `Demo ${roleSuffix.charAt(0).toUpperCase() + roleSuffix.slice(1)}`;
      photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${roleSuffix}`;
    }

    // Check if user exists in database, otherwise create it
    let dbUser = await User.findOne({ firebaseUid });
    if (!dbUser) {
      // Determine role from email or token suffix
      let role: 'user' | 'recruiter' | 'admin' = 'user';
      if (email.includes('admin') || firebaseUid.includes('admin')) {
        role = 'admin';
      } else if (email.includes('recruiter') || firebaseUid.includes('recruiter')) {
        role = 'recruiter';
      }

      // Generate a unique username
      const baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername}${randomSuffix}`;

      dbUser = await User.create({
        firebaseUid,
        email,
        username,
        displayName,
        photoURL,
        role,
        profileScore: 40, // baseline for new account
      });
      console.log(`[Auth] Registered new user: ${email} with role: ${role}`);
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication Error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
