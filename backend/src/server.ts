import app from './app.js';
import config from './config/environment.js';
import connectDB from './config/database.js';
import initializeFirebase from './config/firebase.js';
import logger from './utils/logger.js';
import { initSentry } from './utils/sentry.js';
import * as Sentry from '@sentry/node';
import { createServer } from 'http';

// Initialize Sentry before anything else
initSentry();

const server = createServer(app);

// Initialize services (non-blocking for database)
const initializeServices = async () => {
  try {
    // Initialize Firebase (synchronous)
    initializeFirebase();

    // Connect to MongoDB (non-blocking - don't wait for it)
    // This allows the server to start even if DB is temporarily unavailable
    connectDB().catch((error) => {
      logger.error('Database connection failed, but server will continue:', error);
      logger.warn('⚠️  Health checks will still work. Database will retry automatically.');
    });

    logger.info('✅ Services initialization started');
  } catch (error) {
    logger.error('❌ Service initialization failed:', error);
    // Don't exit - allow server to start for health checks
    // Firebase errors shouldn't prevent server from starting
  }
};

// Start server
const startServer = async () => {
  try {
    // Start server immediately, don't wait for DB
    // This prevents 502 errors during cold starts on Render
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api`);
      logger.info(`📚 Health check: http://localhost:${config.port}/api/health`);
      logger.info(`🏓 Ping endpoint: http://localhost:${config.port}/api/ping`);
    });

    // Initialize services in background (non-blocking)
    await initializeServices();
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  Sentry.captureException(reason as Error);
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export default server;
