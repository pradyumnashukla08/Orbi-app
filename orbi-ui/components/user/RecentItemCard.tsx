import { Pressable, Text, View } from "react-native";
import type { BrainItem, CaptureType } from "../../stores/user/useUserStore";

type RecentItemCardProps = {
  item: BrainItem;
  onPress?: (item: BrainItem) => void;
};

const TYPE_CONFIG: Record<CaptureType, { icon: string; bg: string; border: string }> = {
  note: { icon: "📝", bg: "bg-emerald-950/70", border: "border-emerald-600/40" },
  link: { icon: "🔗", bg: "bg-sky-950/70", border: "border-sky-600/40" },
  image: { icon: "🖼️", bg: "bg-purple-950/70", border: "border-purple-600/40" },
  voice: { icon: "🎙️", bg: "bg-rose-950/70", border: "border-rose-600/40" },
  file: { icon: "📄", bg: "bg-amber-950/70", border: "border-amber-600/40" },
};

const RecentItemCard = ({ item, onPress }: RecentItemCardProps) => {
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.note;

  return (
    <Pressable
      accessibilityLabel={`Open ${item.title}`}
      accessibilityRole="button"
      onPress={() => onPress?.(item)}
      className="flex-row items-center justify-between rounded-2xl border border-orbi-border bg-orbi-card p-3.5 active:border-orbi-borderLight active:bg-orbi-cardHover"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-xl border ${config.bg} ${config.border}`}
        >
          <Text className="text-lg">{config.icon}</Text>
        </View>

        <View className="flex-1 pr-2">
          <Text numberOfLines={1} className="text-sm font-semibold text-white">
            {item.title}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-xs text-slate-400">
            {item.snippet}
          </Text>
        </View>
      </View>

      <View className="items-end gap-1">
        <Text className="text-[11px] font-medium text-slate-500">{item.timestamp}</Text>
        <Text className="text-xs text-slate-500">›</Text>
      </View>
    </Pressable>
  );
};

export default RecentItemCard;
