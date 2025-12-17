import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';
import { HTTP_STATUS } from '../config/constants.js';
import { createErrorResponse } from '../utils/helpers.js';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests, please try again later',
        HTTP_STATUS.TOO_MANY_REQUESTS
      )
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      createErrorResponse(
        'AUTH_RATE_LIMIT_EXCEEDED',
        'Too many authentication attempts, please try again later',
        HTTP_STATUS.TOO_MANY_REQUESTS
      )
    );
  },
});
