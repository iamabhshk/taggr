import { Request, Response, NextFunction } from 'express';
import Label from '../models/Label.model.js';
import User from '../models/User.model.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { NotFoundError } from '../utils/errors.js';
import { HTTP_STATUS } from '../config/constants.js';

export class CliController {
  /**
   * Get all labels for authenticated user (CLI format)
   * GET /api/cli/labels
   */
  async getLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      // Find user
      const user = await User.findOne({ uid: userId });
      if (!user) {
        throw new NotFoundError('User');
      }

      // Get all labels for user
      const labels = await Label.find({ userId: user._id })
        .select('name displayName value description category tags version isPublished packageName metadata')
        .sort({ name: 1 });

      // Increment pull count for all labels (bulk update)
      await Label.updateMany(
        { userId: user._id },
        { $inc: { 'metadata.downloads': 1 } }
      );

      // Format for CLI consumption
      const formattedLabels = labels.map(label => ({
        name: label.name,
        displayName: label.displayName,
        value: label.value,
        description: label.description || '',
        category: label.category || 'general',
        tags: label.tags || [],
        version: label.version,
        isPublished: label.isPublished,
        packageName: label.packageName,
      }));

      res.json(createSuccessResponse({
        labels: formattedLabels,
        count: formattedLabels.length,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single label by name (CLI format)
   * GET /api/cli/labels/:name
   */
  async getLabelByName(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { name } = req.params;

      // Find user
      const user = await User.findOne({ uid: userId });
      if (!user) {
        throw new NotFoundError('User');
      }

      // Find label by name and increment pull count
      const label = await Label.findOneAndUpdate(
        { userId: user._id, name: name.toLowerCase() },
        { $inc: { 'metadata.downloads': 1 } },
        { new: true }
      );

      if (!label) {
        throw new NotFoundError('Label');
      }

      res.json(createSuccessResponse({
        label: {
          name: label.name,
          displayName: label.displayName,
          value: label.value,
          description: label.description || '',
          category: label.category || 'general',
          tags: label.tags || [],
          version: label.version,
          isPublished: label.isPublished,
          packageName: label.packageName,
        },
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify API key and return user info
   * GET /api/cli/whoami
   */
  async whoami(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      // Find user
      const user = await User.findOne({ uid: userId });
      if (!user) {
        throw new NotFoundError('User');
      }

      res.json(createSuccessResponse({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          stats: {
            totalLabels: user.stats.totalLabels,
          },
        },
      }));
    } catch (error) {
      next(error);
    }
  }
}

export default new CliController();

