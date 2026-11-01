import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { getMe, login, signup, verifyOtp } from './auth.controller.js';
import { loginSchema, signupSchema, verifyOtpSchema } from './auth.validation.js';

export const authRoutes = Router();

authRoutes.post('/signup', authRateLimiter, validateBody(signupSchema), signup);
authRoutes.post('/verify-otp', authRateLimiter, validateBody(verifyOtpSchema), verifyOtp);
authRoutes.post('/login', authRateLimiter, validateBody(loginSchema), login);
authRoutes.get('/me', authenticate, getMe);
