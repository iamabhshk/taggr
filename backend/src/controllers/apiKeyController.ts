import { Request, Response, NextFunction } from 'express';
import apiKeyService from '../services/apiKeyService.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';

export class ApiKeyController {
  /**
   * Generate a new API key
   * POST /api/api-keys
   */
  async generateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createSuccessResponse(null, 'Unauthorized')
        );
      }

      const { name, scopes } = req.body;

      if (!name || !name.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createSuccessResponse(null, 'API key name is required')
        );
      }

      const apiKey = await apiKeyService.generateApiKey(req.user.uid, name, scopes);

      res.status(HTTP_STATUS.CREATED).json(
        createSuccessResponse({
          apiKey: {
            _id: apiKey._id,
            key: apiKey.key, // Only shown once during creation
            name: apiKey.name,
            scopes: apiKey.scopes,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all user's API keys
   * GET /api/api-keys
   */
  async listApiKeys(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createSuccessResponse(null, 'Unauthorized')
        );
      }

      const apiKeys = await apiKeyService.listUserApiKeys(req.user.uid);

      // Don't expose the actual key in list (it's only shown during creation)
      const sanitizedKeys = apiKeys.map((key) => ({
        _id: key._id,
        name: key.name,
        scopes: key.scopes,
        lastUsedAt: key.lastUsedAt,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        keyPreview: key.key.substring(0, 15) + '...' + key.key.substring(key.key.length - 4),
      }));

      res.json(
        createSuccessResponse({
          apiKeys: sanitizedKeys,
          total: sanitizedKeys.length,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke an API key
   * DELETE /api/api-keys/:id
   */
  async revokeApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createSuccessResponse(null, 'Unauthorized')
        );
      }

      const { id } = req.params;

      await apiKeyService.revokeApiKey(req.user.uid, id);

      res.json(
        createSuccessResponse({
          message: 'API key revoked successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate an API key
   * POST /api/api-keys/:id/regenerate
   */
  async regenerateApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createSuccessResponse(null, 'Unauthorized')
        );
      }

      const { id } = req.params;

      const apiKey = await apiKeyService.regenerateApiKey(req.user.uid, id);

      res.json(
        createSuccessResponse({
          apiKey: {
            _id: apiKey._id,
            key: apiKey.key,
            name: apiKey.name,
            scopes: apiKey.scopes,
            isActive: apiKey.isActive,
            createdAt: apiKey.createdAt,
          },
        })
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new ApiKeyController();
