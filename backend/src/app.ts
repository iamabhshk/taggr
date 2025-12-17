import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import corsMiddleware from './middleware/cors.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Taggr API',
    version: '1.0.0',
    description: 'Custom Labels Platform API',
    tagline: 'Create Once, Use Everywhere',
    documentation: 'https://docs.taggr.dev',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
