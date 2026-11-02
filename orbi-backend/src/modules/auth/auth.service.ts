import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashValue, verifyHash } from '../../utils/hash.js';
import { refreshTokenExpiry, signAccessToken, signRefreshToken } from '../../utils/jwt.js';
import { sendMail } from '../../utils/mailer.js';
import { toPublicUser } from '../user/user.mapper.js';
import { User } from '../user/user.model.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  LoginResult,
  ResetPasswordInput,
  SignupInput,
  SignupResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from './auth.interface.js';
import { getOtpTemplate } from '../../tamplates/email-tamplates/otp.tampltes.js';

const createOtp = (): string => randomInt(100000, 1000000).toString();

export const signup = async (input: SignupInput): Promise<SignupResult> => {
  const existingUser = await User.exists({ email: input.email });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const otp = createOtp();
  const otpHash = hashValue(otp);
  const passwordHash = input.password
    ? await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS)
    : undefined;

  try {
      const otpData = getOtpTemplate({
        code: otp,
        purpose: "signup", 
        expiresInMinutes: env.OTP_EXPIRES_IN_MINUTES
      });


      await sendMail({
        to: input.email,
        subject: otpData.subject,
        html: otpData.html,
        text: otpData.text
      });
  } catch (error) {
    console.error('[auth] Failed to send signup OTP email', error);
    throw ApiError.internal('Unable to send verification email. Please try again.');
  }

  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    provider: input.provider,
    role: 'user',
    profileImageUrl: input.profileImageUrl,
    otpHash,
    otpHashExpiry: new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000),
  });

  return { user: toPublicUser(user) };
};

export const verifyOtp = async (input: VerifyOtpInput): Promise<VerifyOtpResult> => {
  const user = await User.findOne({ email: input.email }).select('+otpHash +otpHashExpiry');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.otpHash || !user.otpHashExpiry || user.otpHashExpiry.getTime() < Date.now()) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  if (!verifyHash(input.otp, user.otpHash)) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  user.otpHash = undefined;
  user.otpHashExpiry = undefined;
  user.isVerified = true;
  await user.save();

  return { user: toPublicUser(user) };
};

export const login = async (input: LoginInput): Promise<LoginResult> => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.provider !== 'local' || !user.passwordHash) {
    throw ApiError.badRequest('This account uses Google sign-in');
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isVerified) {
    throw ApiError.forbidden('Email not verified. Please verify the OTP first');
  }

  const tokenPayload = {
    sub: user._id.toString(),
    role: user.role,
    provider: user.provider,
  };

  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  user.refreshTokenHash = hashValue(refreshToken);
  user.refreshTokenHashExpiry = refreshTokenExpiry();
  await user.save();

  return {
    user: toPublicUser(user),
    tokenType: 'Bearer',
    accessToken,
    refreshToken,
    accessTokenExpiresIn: env.JWT_ACCESS_EXPIRES_IN_SECONDS,
    refreshTokenExpiresIn: env.JWT_REFRESH_EXPIRES_IN_SECONDS,
  };
};

export const logout = async (userId: string): Promise<void> => {
  await User.updateOne(
    { _id: userId },
    { $unset: { refreshTokenHash: 1, refreshTokenHashExpiry: 1 } },
  );
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const user = await User.findOne({ email: input.email });

  if (!user || user.provider !== 'local') {
    return;
  }

  const otp = createOtp();
  user.otpHash = hashValue(otp);
  user.otpHashExpiry = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);
  await user.save();

  try {
    const otpEmail = getOtpTemplate({
      code: otp,
      purpose: 'password-reset',
      expiresInMinutes: env.OTP_EXPIRES_IN_MINUTES
    });
    await sendMail({
      to: user.email,
      subject: otpEmail.subject,
      html: otpEmail.html,
      text: otpEmail.text
    });
  } catch (error) {
    console.error('[auth] Failed to send password reset OTP email', error);
  }
};

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const user = await User.findOne({ email: input.email }).select('+otpHash +otpHashExpiry');

  if (
    !user ||
    user.provider !== 'local' ||
    !user.otpHash ||
    !user.otpHashExpiry ||
    user.otpHashExpiry.getTime() < Date.now() ||
    !verifyHash(input.otp, user.otpHash)
  ) {
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash, isVerified: true },
      $unset: {
        otpHash: 1,
        otpHashExpiry: 1,
        refreshTokenHash: 1,
        refreshTokenHashExpiry: 1,
      },
    },
  );
};
