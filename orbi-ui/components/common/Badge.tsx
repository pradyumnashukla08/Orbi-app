import { Text, View } from "react-native";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "purple";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const VARIANT_STYLES: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: "bg-slate-800 border-slate-700",
    text: "text-slate-300",
  },
  success: {
    container: "bg-emerald-950/80 border-emerald-800/60",
    text: "text-emerald-300",
  },
  warning: {
    container: "bg-amber-950/80 border-amber-800/60",
    text: "text-amber-300",
  },
  error: {
    container: "bg-rose-950/80 border-rose-800/60",
    text: "text-rose-300",
  },
  info: {
    container: "bg-blue-950/80 border-blue-800/60",
    text: "text-blue-300",
  },
  purple: {
    container: "bg-purple-950/80 border-purple-800/60",
    text: "text-purple-300",
  },
};

const Badge = ({ label, variant = "default", className = "" }: BadgeProps) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <View
      accessibilityRole="text"
      className={`self-start rounded-full border px-2.5 py-0.5 ${styles.container} ${className}`}
    >
      <Text className={`text-xs font-semibold ${styles.text}`}>{label}</Text>
    </View>
  );
};

export default Badge;
