import { Router } from 'express';
import authRoutes from './auth.routes.js';
import labelRoutes from './labels.routes.js';
import userRoutes from './users.routes.js';
import npmRoutes from './npm.routes.js';
import apiKeysRoutes from './apiKeys.routes.js';
import cliRoutes from './cli.routes.js';
import workspacesRoutes from './workspaces.routes.js';
import mongoose from 'mongoose';

const router = Router();

// Ultra-lightweight ping endpoint (no DB check, fastest response)
// Use this for UptimeRobot to keep the service awake
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Health check - should work even if DB is not connected
// Returns 200 OK even if database is disconnected (server is still running)
router.get('/health', (req, res) => {
  // Add cache headers for better performance
  res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    // Return 200 even if DB is disconnected - server is still running
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
