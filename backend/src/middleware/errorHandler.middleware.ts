import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { AppError } from '../utils/errors.js';
import { createErrorResponse } from '../utils/helpers.js';
import { HTTP_STATUS } from '../config/constants.js';
import logger from '../utils/logger.js';
import config from '../config/environment.js';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      createErrorResponse(err.code, err.message, err.statusCode, err.details)
    );
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      createErrorResponse('VALIDATION_ERROR', 'Validation failed', HTTP_STATUS.BAD_REQUEST, err.message)
    );
  }

  // Handle Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return res.status(HTTP_STATUS.CONFLICT).json(
      createErrorResponse(
        'DUPLICATE_ERROR',
        `${field} already exists`,
        HTTP_STATUS.CONFLICT
      )
    );
  }

  // Handle Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      createErrorResponse('INVALID_ID', 'Invalid ID format', HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Send unexpected errors to Sentry
  if (!(err instanceof AppError)) {
    Sentry.captureException(err, {
      tags: {
        url: req.url,
        method: req.method,
      },
      extra: {
        body: req.body,
        query: req.query,
        params: req.params,
      },
    });
  }

  // Default error
  const statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    config.env === 'production' ? 'Internal server error' : err.message;

  res.status(statusCode).json(
    createErrorResponse('INTERNAL_ERROR', message, statusCode)
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json(
    createErrorResponse(
      'NOT_FOUND',
      `Route ${req.originalUrl} not found`,
      HTTP_STATUS.NOT_FOUND
    )
  );
};
