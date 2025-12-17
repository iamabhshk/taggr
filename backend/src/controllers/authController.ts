import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import { ValidationError } from '../utils/errors.js';

export class AuthController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.signup = this.signup.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Validate signup/Google auth request body
   */
  private validateAuthRequest(data: any) {
    if (!data.uid || typeof data.uid !== 'string' || data.uid.trim().length === 0) {
      throw new ValidationError('User ID is required');
    }

    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
      throw new ValidationError('Valid email is required');
    }

    if (!data.displayName || typeof data.displayName !== 'string' || data.displayName.trim().length === 0) {
      throw new ValidationError('Display name is required');
    }

    // Sanitize display name - remove excessive whitespace
    data.displayName = data.displayName.trim().replace(/\s+/g, ' ');

    // Validate display name length
    if (data.displayName.length > 50) {
      throw new ValidationError('Display name must be less than 50 characters');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  /**
   * Register a new user
   * POST /api/auth/signup
   */
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { uid, email, displayName, avatar } = req.body;

      // Validate request
      this.validateAuthRequest({ uid, email, displayName });

      // Check if user already exists
      const existingUser = await userService.getUserByUid(uid);
      if (existingUser) {
        // User already exists, return existing user data
        return res.status(HTTP_STATUS.OK).json(
          createSuccessResponse({
            user: {
              uid: existingUser.uid,
              email: existingUser.email,
              displayName: existingUser.displayName,
              avatar: existingUser.avatar,
            },
            message: 'User already exists',
          })
        );
      }

      // Create new user
      const user = await userService.createUser({
        uid,
        email,
        displayName: displayName.trim(),
        avatar: avatar || '',
      });

      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          message: 'User created successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createSuccessResponse(null)
        );
      }

      const user = await userService.getUserByUid(req.user.uid);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          createSuccessResponse(null)
        );
      }

      res.json(
        createSuccessResponse({
          user: {
            uid: user.uid,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            preferences: user.preferences,
            stats: user.stats,
            createdAt: user.createdAt,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Google Sign-in/Sign-up
   * POST /api/auth/google
   */
  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { uid, email, displayName, avatar } = req.body;

      // Validate request
      this.validateAuthRequest({ uid, email, displayName });

      // Check if user already exists
      let user = await userService.getUserByUid(uid);
      let isNewUser = false;

      if (!user) {
        // Create new user
        user = await userService.createUser({
          uid,
          email,
          displayName: displayName.trim(),
          avatar: avatar || '',
        });
        isNewUser = true;
      } else {
        // Update avatar if provided and different
        if (avatar && avatar !== user.avatar) {
          user = await userService.updateUser(uid, { avatar });
        }
      }

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse({
          user: {
            uid: user.uid,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
          },
          isNewUser,
          message: isNewUser ? 'Account created successfully' : 'Welcome back',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // For Firebase auth, logout is handled client-side
      // This endpoint is mainly for session cleanup if needed
      res.json(
        createSuccessResponse({
          message: 'Logged out successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
