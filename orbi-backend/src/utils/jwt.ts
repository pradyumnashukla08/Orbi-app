import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

export type TokenType = 'access' | 'refresh';

export interface TokenPayload {
  sub: string;
  role: string;
  provider: string;
  type: TokenType;
}

type BasePayload = Omit<TokenPayload, 'type'>;

export const signAccessToken = (payload: BasePayload): string =>
  jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN_SECONDS,
  });

export const signRefreshToken = (payload: BasePayload): string =>
  jwt.sign({ ...payload, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN_SECONDS,
  });

export const verifyAccessToken = (token: string): TokenPayload => {
  let decoded: unknown;

  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    !('sub' in decoded) ||
    !('type' in decoded) ||
    decoded.type !== 'access'
  ) {
    throw ApiError.unauthorized('Invalid access token');
  }

  return decoded as TokenPayload;
};

export const refreshTokenExpiry = (): Date =>
  new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN_SECONDS * 1000);
