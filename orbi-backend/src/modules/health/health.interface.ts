export type HealthState = 'ok' | 'degraded';
export type DatabaseState = 'connected' | 'disconnected';

export interface HealthStatus {
  status: HealthState;
  database: DatabaseState;
  uptime: number;
  timestamp: string;
}
