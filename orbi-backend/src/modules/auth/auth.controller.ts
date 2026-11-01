import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { toPublicUser } from '../user/user.mapper.js';
import type { LoginInput, SignupInput, VerifyOtpInput } from './auth.interface.js';
import {
  login as loginService,
  signup as signupService,
  verifyOtp as verifyOtpService,
} from './auth.service.js';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await signupService(req.body as SignupInput);
  return ApiResponse.created(res, result, 'Account created. Verify the OTP.');
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyOtpService(req.body as VerifyOtpInput);
  return ApiResponse.ok(res, result, 'OTP verified successfully.');
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body as LoginInput);
  return ApiResponse.ok(res, result, 'Login successful.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  return ApiResponse.ok(res, { user: toPublicUser(req.user) }, 'Current user profile.');
});
