import { Router } from 'express';
import cliController from '../controllers/cliController.js';
import { authenticateApiKey, requireScope } from '../middleware/apiKey.middleware.js';

const router = Router();

// All CLI routes require API key authentication
router.use(authenticateApiKey);

// Get user info (verify API key)
router.get('/whoami', cliController.whoami);

// Get all labels for user
router.get('/labels', requireScope('read:labels'), cliController.getLabels);

// Get single label by name
router.get('/labels/:name', requireScope('read:labels'), cliController.getLabelByName);

export default router;

