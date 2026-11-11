import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { allowedOrigins, env } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { requestIdHandler } from './middlewares/requestId.middleware.js';
import { router } from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(requestIdHandler);
  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '12mb' }));
  app.use(express.urlencoded({ extended: true, limit: '12mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use('/api', apiRateLimiter);
  app.use('/api/v1', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
