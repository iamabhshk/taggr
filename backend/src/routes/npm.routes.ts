import { Router } from 'express';
import npmController from '../controllers/npmController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (for npm package installation)
router.get('/@:userId/:labelName', npmController.getPackage);
router.get('/@:userId/:labelName/:version', npmController.getPackageVersion);

// Protected routes
router.post('/publish', authenticate, npmController.publishPackage);

export default router;
