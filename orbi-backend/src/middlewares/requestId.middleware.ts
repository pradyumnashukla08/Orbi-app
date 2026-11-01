import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export const requestIdHandler = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  req.id = typeof incoming === 'string' && incoming.trim() ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
