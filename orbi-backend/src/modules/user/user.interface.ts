import type { HydratedDocument } from 'mongoose';

export type AuthProvider = 'local' | 'google';
export type UserRole = 'user';

export interface IUser {
  fullName: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  role: UserRole;
  isVerified: boolean;
  profileImageUrl?: string | null;
  refreshTokenHash?: string;
  refreshTokenHashExpiry?: Date;
  otpHash?: string;
  otpHashExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  provider: AuthProvider;
  role: UserRole;
  isVerified: boolean;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
