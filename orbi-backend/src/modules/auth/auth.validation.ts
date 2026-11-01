import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().pipe(z.email('A valid email is required'));

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
    email: emailSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be at most 72 characters')
      .optional(),
    provider: z.enum(['local', 'google']).default('local'),
    profileImageUrl: z.url('Profile image URL must be a valid URL').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'local' && !data.password) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password is required for local signup',
      });
    }
  });

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be a 6-digit code'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type SignupBody = z.infer<typeof signupSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
