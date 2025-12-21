import { Router } from 'express';
import authRoutes from './auth.routes.js';
import labelRoutes from './labels.routes.js';
import userRoutes from './users.routes.js';
import npmRoutes from './npm.routes.js';
import apiKeysRoutes from './apiKeys.routes.js';
import cliRoutes from './cli.routes.js';
import workspacesRoutes from './workspaces.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  // Add cache headers for better performance
  res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/labels', labelRoutes);
router.use('/users', userRoutes);
router.use('/npm', npmRoutes);
router.use('/api-keys', apiKeysRoutes);
router.use('/cli', cliRoutes);
router.use('/workspaces', workspacesRoutes);

export default router;
