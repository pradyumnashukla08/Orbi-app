import { Schema, model } from 'mongoose';
import type { IImage } from './image.interface.js';

const imageSchema = new Schema<IImage>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    collection: { type: String, required: true, trim: true, maxlength: 80 },
    mimeType: { type: String, required: true, enum: ['image/jpeg', 'image/png', 'image/webp'] },
    dataUrl: { type: String, required: true, maxlength: 10_000_000 },
  },
  { timestamps: true, versionKey: false },
);

export const Image = model<IImage>('Image', imageSchema);
