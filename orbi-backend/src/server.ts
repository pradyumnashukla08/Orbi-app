import type { Server } from 'node:http';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const registerShutdownHandlers = (server: Server): void => {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[server] ${signal} received, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      console.error('[server] Shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(() => {
      void disconnectDatabase()
        .then(() => {
          console.log('[server] Closed remaining connections');
          process.exit(0);
        })
        .catch((error: unknown) => {
          console.error('[server] Error during shutdown:', error);
          process.exit(1);
        });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

const startServer = async (): Promise<void> => {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[server] Listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`[server] Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  registerShutdownHandlers(server);
};

process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[process] Uncaught exception:', error);
  process.exit(1);
});

startServer().catch((error: unknown) => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
