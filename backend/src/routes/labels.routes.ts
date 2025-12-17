import { Router } from 'express';
import labelController from '../controllers/labelController.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate, validateQuery } from '../middleware/validation.middleware.js';
import {
  createLabelSchema,
  updateLabelSchema,
  publishLabelSchema,
  searchLabelsSchema,
} from '../utils/validators.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Label statistics
router.get('/stats', labelController.getLabelStats);

// Search labels
router.get('/search', validateQuery(searchLabelsSchema), labelController.searchLabels);

// Bulk operations
router.post('/bulk/export', labelController.exportLabels);
router.post('/bulk/import', labelController.importLabels);

// CRUD operations
router.get('/', validateQuery(searchLabelsSchema), labelController.getLabels);
router.post('/', validate(createLabelSchema), labelController.createLabel);
router.get('/:id', labelController.getLabelById);
router.patch('/:id', validate(updateLabelSchema), labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);

// Version management
router.get('/:id/versions', labelController.getVersionHistory);
router.post('/:id/publish', validate(publishLabelSchema), labelController.publishLabel);

export default router;
