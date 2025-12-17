import admin from 'firebase-admin';
import logger from '../utils/logger.js';

const initializeFirebase = (): void => {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
      logger.warn('⚠️  Firebase credentials not configured - authentication will not work');
      logger.info('Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in .env');
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    logger.info('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('❌ Firebase initialization failed:', error);
    logger.warn('Server will start but authentication will not work');
  }
};

export const getAuth = () => {
  try {
    return admin.auth();
  } catch (error) {
    throw new Error('Firebase not initialized. Please configure Firebase credentials.');
  }
};

export default initializeFirebase;
