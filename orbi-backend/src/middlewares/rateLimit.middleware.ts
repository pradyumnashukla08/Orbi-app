import { rateLimit } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';

const tooManyRequests = (req: Request, res: Response): void => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    requestId: req.id,
  });
};

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: tooManyRequests,
});

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => env.NODE_ENV === 'test',
  handler: tooManyRequests,
});
