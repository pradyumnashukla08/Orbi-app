import type { NextFunction, Request, Response } from 'express';
import { User } from '../modules/user/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authorization token is required');
    }

    const token = header.slice('Bearer '.length).trim();

    if (!token) {
      throw ApiError.unauthorized('Authorization token is required');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    if (!user.isVerified) {
      throw ApiError.forbidden('Email not verified. Please verify the OTP first');
    }

    req.auth = {
      userId: user._id.toString(),
      role: user.role,
      provider: user.provider,
    };
    req.user = user;

    next();
  },
);
