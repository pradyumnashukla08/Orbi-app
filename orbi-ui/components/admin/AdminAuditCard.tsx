import { Text, View } from "react-native";
import Badge from "../common/Badge";
import type { BadgeVariant } from "../common/Badge";
import type { AuditLogEntry } from "../../stores/admin/useAdminStore";

type AdminAuditCardProps = {
  log: AuditLogEntry;
};

const SEVERITY_VARIANTS: Record<string, BadgeVariant> = {
  info: "info",
  warning: "warning",
  error: "error",
};

const AdminAuditCard = ({ log }: AdminAuditCardProps) => {
  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-white">{log.action}</Text>
        <Badge
          label={log.severity.toUpperCase()}
          variant={SEVERITY_VARIANTS[log.severity] ?? "default"}
        />
      </View>

      <Text className="text-xs text-slate-300">
        Target: <Text className="font-semibold text-slate-100">{log.target}</Text>
      </Text>

      <View className="mt-3 flex-row items-center justify-between border-t border-slate-800/60 pt-2.5">
        <Text className="text-[11px] text-slate-400">By: {log.actor}</Text>
        <Text className="text-[11px] text-slate-500">{log.timestamp}</Text>
      </View>
    </View>
  );
};

export default AdminAuditCard;
