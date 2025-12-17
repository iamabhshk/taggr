import { Request, Response, NextFunction } from 'express';
import labelService from '../services/labelService.js';
import npmService from '../services/npmService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

export class NpmController {
  /**
   * Get package for a label
   * GET /api/npm/@:userId/:labelName
   */
  async getPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, labelName } = req.params;

      // This would fetch from npm registry in production
      res.json(
        createSuccessResponse({
          packageName: `@${userId}/${labelName}`,
          message: 'Fetch from npm registry',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific version of a package
   * GET /api/npm/@:userId/:labelName/:version
   */
  async getPackageVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, labelName, version } = req.params;

      res.json(
        createSuccessResponse({
          packageName: `@${userId}/${labelName}`,
          version,
          message: 'Fetch specific version from npm registry',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish label to npm
   * POST /api/npm/publish
   */
  async publishPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { labelId } = req.body;

      const label = await labelService.getLabelById(userId, labelId);

      // Generate package structure
      const packageStructure = npmService.generatePackageStructure(label, userId);

      // Publish to npm (simulated in MVP)
      const result = await npmService.publishToNpm(label, userId);

      if (result.success) {
        // Update label with npm package ID
        label.npmPackageId = result.packageId;
        label.isPublished = true;
        await label.save();

        res.json(
          createSuccessResponse({
            success: true,
            packageName: label.packageName,
            version: label.version,
            npmPackageId: result.packageId,
          })
        );
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createSuccessResponse({
            success: false,
            message: 'Failed to publish package',
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new NpmController();
