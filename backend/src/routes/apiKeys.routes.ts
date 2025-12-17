import { Router } from 'express';
import apiKeyController from '../controllers/apiKeyController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All API key routes require authentication
router.post('/', authenticate, apiKeyController.generateApiKey);
router.get('/', authenticate, apiKeyController.listApiKeys);
router.post('/:id/regenerate', authenticate, apiKeyController.regenerateApiKey);
router.delete('/:id', authenticate, apiKeyController.revokeApiKey);

export default router;
