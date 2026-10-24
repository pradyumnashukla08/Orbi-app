import { create } from "zustand";

export type AuditLogEntry = {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  severity: "info" | "warning" | "error";
  ipAddress: string;
};

type AdminMetrics = {
  activeUsers: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  apiRequestsPerMin: number;
  systemHealth: "Optimal" | "Degraded" | "Maintenance";
};

type AdminState = {
  metrics: AdminMetrics;
  auditLogs: AuditLogEntry[];
  selectedSeverity: "all" | "info" | "warning" | "error";
  setSelectedSeverity: (severity: "all" | "info" | "warning" | "error") => void;
};

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    action: "Role Escalation Granted",
    actor: "sarah.chen@orbi.internal",
    target: "Alex Rivera -> Admin",
    timestamp: "10 mins ago",
    severity: "warning",
    ipAddress: "192.168.1.42",
  },
  {
    id: "log-2",
    action: "SSL Certificate Auto-Renewed",
    actor: "system_daemon",
    target: "api.orbi.internal",
    timestamp: "32 mins ago",
    severity: "info",
    ipAddress: "127.0.0.1",
  },
  {
    id: "log-3",
    action: "Rate Limit Exceeded (429)",
    actor: "anon_client_982",
    target: "/v1/auth/tokens",
    timestamp: "1 hour ago",
    severity: "error",
    ipAddress: "45.132.88.19",
  },
  {
    id: "log-4",
    action: "Production Backup Completed",
    actor: "backup_cron",
    target: "s3://orbi-backups/db",
    timestamp: "2 hours ago",
    severity: "info",
    ipAddress: "10.0.0.8",
  },
];

export const useAdminStore = create<AdminState>((set) => ({
  metrics: {
    activeUsers: 1420,
    cpuUsagePercent: 34,
    memoryUsagePercent: 58,
    apiRequestsPerMin: 18400,
    systemHealth: "Optimal",
  },
  auditLogs: INITIAL_LOGS,
  selectedSeverity: "all",
  setSelectedSeverity: (severity) => set({ selectedSeverity: severity }),
}));
