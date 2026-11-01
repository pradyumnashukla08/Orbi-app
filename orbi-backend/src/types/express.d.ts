import type { UserDocument } from '../modules/user/user.interface.js';

declare global {
  namespace Express {
    interface Request {
      id: string;
      auth?: {
        userId: string;
        role: string;
        provider: string;
      };
      user?: UserDocument;
    }
  }
}

export {};
