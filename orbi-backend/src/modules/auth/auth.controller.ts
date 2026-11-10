import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { toPublicUser } from '../user/user.mapper.js';
import type {
  ForgotPasswordInput,
  GoogleLoginInput,
  LoginInput,
  ResetPasswordInput,
  RotateTokenInput,
  SignupInput,
  VerifyOtpInput,
} from './auth.interface.js';
import {
  forgotPassword as forgotPasswordService,
  googleLogin as googleLoginService,
  login as loginService,
  logout as logoutService,
  resetPassword as resetPasswordService,
  rotateToken as rotateTokenService,
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

export const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await googleLoginService(req.body as GoogleLoginInput);
  return ApiResponse.ok(res, result, 'Login successful.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  return ApiResponse.ok(res, { user: toPublicUser(req.user) }, 'Current user profile.');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  await logoutService(req.user._id.toString());
  return ApiResponse.ok(res, null, 'Logged out successfully.');
});

export const rotateToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await rotateTokenService(req.body as RotateTokenInput);
  return ApiResponse.ok(res, result, 'Token rotated successfully.');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await forgotPasswordService(req.body as ForgotPasswordInput);
  return ApiResponse.ok(
    res,
    null,
    'If this email is registered, a password reset OTP has been sent.',
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await resetPasswordService(req.body as ResetPasswordInput);
  return ApiResponse.ok(res, null, 'Password reset successfully. Please login with the new password.');
});
