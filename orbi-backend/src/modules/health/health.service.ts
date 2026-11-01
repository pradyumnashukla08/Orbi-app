import { isDatabaseConnected } from '../../config/database.js';
import type { HealthStatus } from './health.interface.js';

export const getHealthStatus = (): HealthStatus => {
  const database = isDatabaseConnected();

  return {
    status: database ? 'ok' : 'degraded',
    database: database ? 'connected' : 'disconnected',
    uptime: Number(process.uptime().toFixed(3)),
    timestamp: new Date().toISOString(),
  };
};
