import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateBody } from '../../middlewares/validate.middleware.js';
import { createImage } from './image.controller.js';
import { createImageSchema } from './image.validation.js';

export const imageRoutes = Router();

imageRoutes.post('/', authenticate, validateBody(createImageSchema), createImage);
