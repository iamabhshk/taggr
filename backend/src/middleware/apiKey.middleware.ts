import { Request, Response, NextFunction } from 'express';
import ApiKey from '../models/ApiKey.model.js';
import User from '../models/User.model.js';
import { UnauthorizedError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate requests using API key
 * Expects X-API-Key header
 */
export const authenticateApiKey = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key is required. Use X-API-Key header.');
    }

    // Find the API key in database
    const apiKeyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!apiKeyDoc) {
      throw new UnauthorizedError('Invalid or inactive API key');
    }

    // Check if expired
    if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
      throw new UnauthorizedError('API key has expired');
    }

    // Find the user associated with this API key
    const user = await User.findById(apiKeyDoc.userId);

    if (!user) {
      throw new UnauthorizedError('User not found for this API key');
    }

    // Update last used timestamp
    apiKeyDoc.lastUsedAt = new Date();
    await apiKeyDoc.save();

    // Attach user to request
    req.user = {
      uid: user.uid,
      email: user.email,
    };

    // Attach API key scopes for permission checking
    (req as any).apiKeyScopes = apiKeyDoc.scopes;

    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }

    logger.error('API key authentication error:', error);
    next(new UnauthorizedError('API key authentication failed'));
  }
};

/**
 * Middleware to check if API key has required scope
 */
export const requireScope = (scope: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const scopes = (req as any).apiKeyScopes || [];

    if (!scopes.includes(scope) && !scopes.includes('*')) {
      return next(new UnauthorizedError(`API key does not have required scope: ${scope}`));
    }

    next();
  };
};

