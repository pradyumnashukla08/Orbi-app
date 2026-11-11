import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { Image } from './image.model.js';
import type { CreateImageBody } from './image.validation.js';

export const createImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw ApiError.unauthorized('Authentication required');
  }

  const body = req.body as CreateImageBody;
  const image = await Image.create({ ...body, userId: req.auth.userId });

  return ApiResponse.created(
    res,
    {
      id: image._id.toString(),
      title: image.title,
      collection: image.collection,
      mimeType: image.mimeType,
      createdAt: image.createdAt,
    },
    'Image saved successfully.',
  );
});
