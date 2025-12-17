import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase.js';
import User from '../models/User.model.js';
import { UnauthorizedError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase ID token
    const firebaseAuth = getAuth();
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Find user in database
    const user = await User.findOne({ uid });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Update last active (debounced - only update if more than 5 minutes since last update)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!user.stats.lastActiveAt || user.stats.lastActiveAt < fiveMinutesAgo) {
      user.stats.lastActiveAt = new Date();
      await user.save();
    }

    // Attach user to request
    req.user = {
      uid: user.uid,
      email: user.email,
    };

    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    if (error.code === 'auth/id-token-expired') {
      return next(new UnauthorizedError('Token expired'));
    }

    if (error.code === 'auth/argument-error') {
      return next(new UnauthorizedError('Invalid token'));
    }

    logger.error('Authentication error:', error);
    next(new UnauthorizedError('Authentication failed'));
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const firebaseAuth = getAuth();
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    const user = await User.findOne({ uid: decodedToken.uid });

    if (user) {
      req.user = {
        uid: user.uid,
        email: user.email,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without user
    next();
  }
};
