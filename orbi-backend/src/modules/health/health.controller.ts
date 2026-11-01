import type { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getHealthStatus } from './health.service.js';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = getHealthStatus();
  const statusCode = health.status === 'ok' ? 200 : 503;

  return ApiResponse.ok(res, health, 'Service health status', statusCode);
});
