import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

export class UserController {
  /**
   * Get user profile
   * GET /api/users/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const userId = req.user!.uid;

      const user = await userService.getUserByUid(userId);

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
   * Update user profile
   * PATCH /api/users/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const data = req.body;

      const user = await userService.updateUser(userId, data);

      res.json(
        createSuccessResponse({
          user: {
            uid: user.uid,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            preferences: user.preferences,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check username availability
   * GET /api/users/check-username/:username
   */
  async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      const currentUserId = req.user?.uid;

      const available = await userService.isUsernameAvailable(username, currentUserId);

      res.json(createSuccessResponse({ available }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activity
   * GET /api/users/activity
   */
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const limit = parseInt(req.query.limit as string) || 20;

      const activities = await userService.getRecentActivity(userId, limit);

      res.json(createSuccessResponse({ activities }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/users/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const stats = await userService.getUserStats(userId);

      res.json(createSuccessResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   * DELETE /api/users/account
   */
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      await userService.deleteUser(userId);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
