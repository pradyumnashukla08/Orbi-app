import { Pressable, Text, View } from "react-native";
import type { Collection } from "../../stores/user/useUserStore";

type CollectionCardProps = {
  collection: Collection;
  onPress?: (collection: Collection) => void;
};

const CollectionCard = ({ collection, onPress }: CollectionCardProps) => {
  return (
    <Pressable
      accessibilityLabel={`Open collection ${collection.name}`}
      accessibilityRole="button"
      onPress={() => onPress?.(collection)}
      className="flex-1 min-w-[46%] rounded-2xl border border-orbi-border bg-orbi-card p-4 active:border-orbi-primary/40 active:bg-orbi-cardHover"
    >
      <View
        style={{ backgroundColor: `${collection.accentColor}20` }}
        className="mb-3 h-10 w-10 items-center justify-center rounded-xl"
      >
        <Text className="text-xl">{collection.emoji}</Text>
      </View>

      <Text className="text-base font-bold text-white">{collection.name}</Text>
      <Text className="mt-1 text-xs text-slate-400">{collection.count} items</Text>

      <View className="mt-3 flex-row items-center justify-between border-t border-orbi-border/60 pt-2.5">
        <View
          style={{ backgroundColor: collection.accentColor }}
          className="h-1.5 w-6 rounded-full"
        />
        <Text className="text-xs text-slate-500">→</Text>
      </View>
    </Pressable>
  );
};

export default CollectionCard;
