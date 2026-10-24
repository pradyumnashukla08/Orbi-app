import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import ScreenHeader from "../../components/common/ScreenHeader";
import AdminAuditCard from "../../components/admin/AdminAuditCard";
import AdminAuditSkeleton from "../../components/admin/AdminAuditSkeleton";
import { useAdminStore } from "../../stores/admin/useAdminStore";

const AdminDashboard = () => {
  const { metrics, auditLogs, selectedSeverity, setSelectedSeverity } = useAdminStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedSeverity === "all") return true;
    return log.severity === selectedSeverity;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Toast.show({
        type: "success",
        text1: "Audit Logs Synchronized",
        text2: "Latest 25 system events fetched from cluster.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerSecurityScan = async () => {
    setIsScanning(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Toast.show({
        type: "success",
        text1: "Security Scan Complete",
        text2: "0 vulnerabilities found across all active pods.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const severityTabs: { key: "all" | "info" | "warning" | "error"; label: string }[] = [
    { key: "all", label: `All (${auditLogs.length})` },
    { key: "warning", label: "Warnings" },
    { key: "error", label: "Errors" },
    { key: "info", label: "Info" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        <ScreenHeader
          title="Admin Operations"
          subtitle="Enterprise Cloud & Governance"
          showBack={true}
          rightAction={
            <Button
              title="Sync Logs"
              size="sm"
              variant="outline"
              isLoading={isLoading}
              onPress={handleRefresh}
              accessibilityLabel="Sync audit logs"
            />
          }
        />

        {/* System Health Status Card */}
        <Card className="mb-6 border-purple-900/50 bg-purple-950/20">
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-3 w-3 rounded-full bg-emerald-400" />
              <Text className="text-base font-bold text-white">System Status: {metrics.systemHealth}</Text>
            </View>
            <Badge label="SOC2 Type II" variant="purple" />
          </View>

          <View className="mt-2 flex-row justify-between gap-2 border-t border-purple-900/40 pt-3">
            <View>
              <Text className="text-[11px] text-slate-400">Active Users</Text>
              <Text className="text-base font-bold text-white">{metrics.activeUsers}</Text>
            </View>
            <View>
              <Text className="text-[11px] text-slate-400">CPU Load</Text>
              <Text className="text-base font-bold text-emerald-400">{metrics.cpuUsagePercent}%</Text>
            </View>
            <View>
              <Text className="text-[11px] text-slate-400">Memory</Text>
              <Text className="text-base font-bold text-indigo-400">{metrics.memoryUsagePercent}%</Text>
            </View>
            <View>
              <Text className="text-[11px] text-slate-400">Throughput</Text>
              <Text className="text-base font-bold text-purple-400">
                {(metrics.apiRequestsPerMin / 1000).toFixed(1)}k/m
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Operations Actions */}
        <View className="mb-6">
          <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            Rapid Operations
          </Text>
          <View className="flex-row gap-3">
            <Button
              title="Run Security Scan"
              variant="primary"
              size="sm"
              className="flex-1 bg-purple-600 active:bg-purple-700 border-purple-500"
              isLoading={isScanning}
              onPress={handleTriggerSecurityScan}
              accessibilityLabel="Run Security Scan"
            />
            <Button
              title="Flush Cache"
              variant="secondary"
              size="sm"
              className="flex-1"
              onPress={() =>
                Toast.show({
                  type: "info",
                  text1: "Cache Purged",
                  text2: "Edge CDN cache cleared across all regions.",
                })
              }
              accessibilityLabel="Flush Cache"
            />
          </View>
        </View>

        {/* Severity Filter Tabs */}
        <View className="mb-4">
          <Text className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            Audit Activity Logs
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {severityTabs.map((tab) => {
              const active = selectedSeverity === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setSelectedSeverity(tab.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${tab.label}`}
                  className={`rounded-xl px-3 py-1.5 border mr-2 ${
                    active
                      ? "border-purple-500 bg-purple-600"
                      : "border-slate-800 bg-slate-900 active:bg-slate-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Logs List or Skeleton */}
        {isLoading ? (
          <AdminAuditSkeleton />
        ) : filteredLogs.length === 0 ? (
          <Card className="items-center py-8">
            <Text className="text-base font-semibold text-slate-400">No logs for this severity</Text>
            <Text className="mt-1 text-xs text-slate-500">
              Select another filter tab or refresh logs.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {filteredLogs.map((log) => (
              <AdminAuditCard key={log.id} log={log} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
