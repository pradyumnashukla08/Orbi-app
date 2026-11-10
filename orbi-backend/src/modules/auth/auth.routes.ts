import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  resetPassword,
  rotateToken,
  signup,
  verifyOtp,
} from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  rotateTokenSchema,
  signupSchema,
  verifyOtpSchema,
} from './auth.validation.js';

export const authRoutes = Router();

authRoutes.post('/signup', authRateLimiter, validateBody(signupSchema), signup);
authRoutes.post('/verify-otp', authRateLimiter, validateBody(verifyOtpSchema), verifyOtp);
authRoutes.post('/login', authRateLimiter, validateBody(loginSchema), login);
authRoutes.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
authRoutes.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), resetPassword);
authRoutes.post('/rotate-token', authRateLimiter, validateBody(rotateTokenSchema), rotateToken);
authRoutes.get('/me', authenticate, getMe);
authRoutes.post('/logout', authenticate, logout);
