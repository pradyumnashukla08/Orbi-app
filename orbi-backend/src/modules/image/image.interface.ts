import type { HydratedDocument } from 'mongoose';

export interface IImage {
  userId: string;
  title: string;
  collection: string;
  mimeType: string;
  dataUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ImageDocument = HydratedDocument<IImage>;

export interface CreateImageInput {
  title: string;
  collection: string;
  mimeType: string;
  dataUrl: string;
}
