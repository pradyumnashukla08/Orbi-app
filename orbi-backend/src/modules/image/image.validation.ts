import { z } from 'zod';

export const createImageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  collection: z.string().trim().min(1).max(80),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  dataUrl: z
    .string()
    .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/, 'A valid image data URL is required')
    .max(10_000_000),
});

export type CreateImageBody = z.infer<typeof createImageSchema>;
