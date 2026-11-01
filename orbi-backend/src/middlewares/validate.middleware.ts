import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const validateBody = <T>(schema: ZodType<T>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      next(ApiError.unprocessable('Validation failed', details));
      return;
    }

    req.body = result.data;
    next();
  };
};
