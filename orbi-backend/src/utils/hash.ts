import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

export const hashValue = (value: string): string =>
  createHmac('sha256', env.HASH_SECRET).update(value).digest('hex');

export const verifyHash = (value: string, expectedHash: string): boolean => {
  const actual = Buffer.from(hashValue(value));
  const expected = Buffer.from(expectedHash);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
