import { Request, Response, NextFunction } from 'express';
import labelService from '../services/labelService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import { SearchParams } from '../types/index.js';
import { ValidationError } from '../utils/errors.js';

export class LabelController {
  constructor() {
    // Bind methods to preserve 'this' context when used as route handlers
    this.getLabels = this.getLabels.bind(this);
    this.getLabelById = this.getLabelById.bind(this);
    this.createLabel = this.createLabel.bind(this);
    this.updateLabel = this.updateLabel.bind(this);
    this.deleteLabel = this.deleteLabel.bind(this);
    this.publishLabel = this.publishLabel.bind(this);
    this.getVersionHistory = this.getVersionHistory.bind(this);
    this.searchLabels = this.searchLabels.bind(this);
    this.exportLabels = this.exportLabels.bind(this);
    this.importLabels = this.importLabels.bind(this);
    this.getLabelStats = this.getLabelStats.bind(this);
  }

  /**
   * Validate label creation/update data
   */
  private validateLabelData(data: any, isUpdate = false) {
    if (!isUpdate) {
      // Required fields for creation
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new ValidationError('Label name is required');
      }

      if (!data.displayName || typeof data.displayName !== 'string' || data.displayName.trim().length === 0) {
        throw new ValidationError('Display name is required');
      }

      if (!data.value || typeof data.value !== 'string' || data.value.trim().length === 0) {
        throw new ValidationError('Label value is required');
      }
    }

    // Validate name format (alphanumeric, hyphens, underscores only)
    if (data.name) {
      const nameRegex = /^[a-zA-Z0-9-_]+$/;
      if (!nameRegex.test(data.name)) {
        throw new ValidationError('Label name can only contain letters, numbers, hyphens, and underscores');
      }

      if (data.name.length > 50) {
        throw new ValidationError('Label name must be less than 50 characters');
      }
    }

    // Validate display name
    if (data.displayName) {
      data.displayName = data.displayName.trim();
      if (data.displayName.length > 100) {
        throw new ValidationError('Display name must be less than 100 characters');
      }
    }

    // Validate value
    if (data.value) {
      data.value = data.value.trim();
      if (data.value.length > 10000) {
        throw new ValidationError('Label value must be less than 10,000 characters');
      }
    }

    // Validate description
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        throw new ValidationError('Description must be a string');
      }
      data.description = data.description.trim();
      if (data.description.length > 500) {
        throw new ValidationError('Description must be less than 500 characters');
      }
    }

    // Validate category
    if (data.category !== undefined) {
      if (typeof data.category !== 'string') {
        throw new ValidationError('Category must be a string');
      }
      data.category = data.category.trim();
      if (data.category.length > 50) {
        throw new ValidationError('Category must be less than 50 characters');
      }
    }

    // Validate tags
    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        throw new ValidationError('Tags must be an array');
      }
      if (data.tags.length > 10) {
        throw new ValidationError('Maximum 10 tags allowed');
      }
      data.tags = data.tags.map((tag: any) => {
        if (typeof tag !== 'string') {
          throw new ValidationError('Each tag must be a string');
        }
        const trimmedTag = tag.trim();
        if (trimmedTag.length > 30) {
          throw new ValidationError('Each tag must be less than 30 characters');
        }
        return trimmedTag;
      }).filter((tag: string) => tag.length > 0);
    }
  }
  /**
   * Get all labels for current user
   * GET /api/labels
   */
  async getLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const params = req.query as unknown as SearchParams;

      const result = await labelService.getLabels(userId, params);

      res.json(
        createSuccessResponse(result, {
          pagination: {
            page: result.page,
            totalPages: result.totalPages,
            total: result.total,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single label by ID
   * GET /api/labels/:id
   */
  async getLabelById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const label = await labelService.getLabelById(userId, id);

      res.json(createSuccessResponse({ label }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new label
   * POST /api/labels
   */
  async createLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const data = req.body;

      // Validate label data
      this.validateLabelData(data);

      const label = await labelService.createLabel(userId, data);

      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse({
          label,
          message: 'Label created successfully'
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update label
   * PATCH /api/labels/:id
   */
  async updateLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const data = req.body;

      // Validate label data (for update)
      this.validateLabelData(data, true);

      const label = await labelService.updateLabel(userId, id, data);

      res.json(createSuccessResponse({
        label,
        message: 'Label updated successfully'
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete label
   * DELETE /api/labels/:id
   */
  async deleteLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      await labelService.deleteLabel(userId, id);

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish label to npm
   * POST /api/labels/:id/publish
   */
  async publishLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;
      const { changelog, versionBump } = req.body;

      const label = await labelService.publishLabel(userId, id, changelog, versionBump);

      res.json(
        createSuccessResponse({
          label,
          message: 'Label published successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get version history
   * GET /api/labels/:id/versions
   */
  async getVersionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { id } = req.params;

      const versions = await labelService.getVersionHistory(userId, id);

      res.json(createSuccessResponse({ versions }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search labels
   * GET /api/labels/search
   */
  async searchLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const params = req.query as unknown as SearchParams;

      const result = await labelService.getLabels(userId, params);

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export all labels
   * POST /api/labels/bulk/export
   */
  async exportLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const labels = await labelService.exportLabels(userId);

      res.json(
        createSuccessResponse({
          labels,
          count: labels.length,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import labels
   * POST /api/labels/bulk/import
   */
  async importLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;
      const { labels } = req.body;

      const result = await labelService.importLabels(userId, labels);

      res.json(createSuccessResponse(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get label statistics
   * GET /api/labels/stats
   */
  async getLabelStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.uid;

      const stats = await labelService.getLabelStats(userId);

      res.json(createSuccessResponse({ stats }));
    } catch (error) {
      next(error);
    }
  }
}

export default new LabelController();
