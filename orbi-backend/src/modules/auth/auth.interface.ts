import type { AuthProvider, PublicUser } from '../user/user.interface.js';

export interface SignupInput {
  fullName: string;
  email: string;
  password?: string;
  provider: AuthProvider;
  profileImageUrl?: string;
}

export interface SignupResult {
  user: PublicUser;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface VerifyOtpResult {
  user: PublicUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: PublicUser;
  tokenType: 'Bearer';
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}
