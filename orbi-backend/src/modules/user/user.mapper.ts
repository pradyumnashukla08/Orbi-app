import type { PublicUser, UserDocument } from './user.interface.js';

export const toPublicUser = (user: UserDocument): PublicUser => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  provider: user.provider,
  role: user.role,
  isVerified: user.isVerified,
  profileImageUrl: user.profileImageUrl ?? null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
