import 'dotenv/config';
import { z } from 'zod';

const emptyToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().pipe(z.email('Must be a valid email address')).optional(),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    CORS_ORIGIN: z.string().default('*'),
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    HASH_SECRET: z.string().min(32, 'HASH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
    JWT_REFRESH_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(604800),
    OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(10),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
    RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    SMTP_USER: optionalEmail,
    SMTP_PASS: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .transform((value) => value.replace(/\s/g, ''))
        .optional(),
    ),
    MAIL_FROM: optionalEmail,
    MAIL_FROM_NAME: z.preprocess(emptyToUndefined, z.string().trim().default('ORBI')),
  })
  .superRefine((value, ctx) => {
    if (Boolean(value.SMTP_USER) !== Boolean(value.SMTP_PASS)) {
      ctx.addIssue({
        code: 'custom',
        path: ['SMTP_USER'],
        message: 'SMTP_USER and SMTP_PASS must be set together',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins =
  env.CORS_ORIGIN === '*'
    ? true
    : env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
