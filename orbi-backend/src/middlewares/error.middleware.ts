import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

interface ErrorLocation {
  file?: string;
  line?: number;
  column?: number;
  frame: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  requestId: string;
  details?: unknown;
  error?: {
    name: string;
    location?: ErrorLocation;
    stack?: string;
  };
}

const INTERNAL_PATH = /[\\/](src|dist)[\\/]/;
const NOISE_FRAME = /[\\/]utils[\\/](ApiError|asyncHandler)\.[jt]s/;

const isInternalFrame = (frame: string): boolean =>
  INTERNAL_PATH.test(frame) && !frame.includes('node_modules');

const isNoiseFrame = (frame: string): boolean => NOISE_FRAME.test(frame);

const parseFrame = (frame: string): ErrorLocation => {
  const match = frame.match(/\(?([^()]+):(\d+):(\d+)\)?$/);

  if (!match) {
    return { frame };
  }

  return {
    file: match[1],
    line: Number(match[2]),
    column: Number(match[3]),
    frame,
  };
};

export const getErrorLocation = (error: Error): ErrorLocation | undefined => {
  if (!error.stack) return undefined;

  const frames = error.stack
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at '));

  const internalFrame =
    frames.find((frame) => isInternalFrame(frame) && !isNoiseFrame(frame)) ??
    frames.find(isInternalFrame);
  const selected = internalFrame ?? frames[0];

  return selected ? parseFrame(selected) : undefined;
};

const resolveError = (
  error: unknown,
): { statusCode: number; message: string; details?: unknown } => {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message, details: error.details };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: 'Validation failed',
      details: Object.values(error.errors).map((fieldError) => ({
        field: fieldError.path,
        message: fieldError.message,
      })),
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: `Invalid value for ${error.path}` };
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return { statusCode: 400, message: 'Malformed JSON payload' };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    };
  }

  return { statusCode: 500, message: 'Internal server error' };
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const { statusCode, message, details } = resolveError(error);
  const isDevelopment = env.NODE_ENV === 'development';

  console.error(
    `[error] ${req.method} ${req.originalUrl} -> ${statusCode} (requestId: ${req.id})`,
  );

  if (statusCode >= 500) {
    console.error(error);
  }

  const body: ErrorResponse = {
    success: false,
    message,
    requestId: req.id,
    ...(details !== undefined && { details }),
  };

  if (isDevelopment && error instanceof Error) {
    body.error = {
      name: error.name,
      location: getErrorLocation(error),
      stack: error.stack,
    };
  }

  res.status(statusCode).json(body);
};
