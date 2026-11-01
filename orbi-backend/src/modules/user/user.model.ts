import { Schema, model } from 'mongoose';
import type { IUser } from './user.interface.js';

const userSchema = new Schema<IUser>(
  {
    fullName: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 80 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      select: false 
    },
    provider: { 
      type: String, 
      enum: ['local', 'google'], 
      default: 'local', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['user'], 
      default: 'user', 
      required: true 
    },
    isVerified: { 
      type: Boolean, 
      default: false, 
      required: true 
    },
    profileImageUrl: { 
      type: String, 
      default: null 
    },
    refreshTokenHash: { 
      type: String, 
      select: false 
    },
    refreshTokenHashExpiry: { 
      type: Date, 
      select: false 
    },
    otpHash: { 
      type: String, 
      select: false 
    },
    otpHashExpiry: { 
      type: Date, 
      select: false 
    },
  },
  { timestamps: true, versionKey: false },
);

export const User = model<IUser>('User', userSchema);
