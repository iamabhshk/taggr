import { Router } from 'express';
import userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateUserSchema } from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', validate(updateUserSchema), userController.updateProfile);
router.get('/check-username/:username', userController.checkUsername);
router.get('/activity', userController.getRecentActivity);
router.get('/stats', userController.getStats);
router.delete('/account', userController.deleteAccount);

export default router;
