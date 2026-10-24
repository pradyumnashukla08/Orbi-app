import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
};

const ScreenHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = "",
}: ScreenHeaderProps) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View className={`flex-row items-center justify-between pb-4 pt-2 ${className}`}>
      <View className="flex-row items-center gap-3">
        {showBack && (
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 active:bg-slate-800"
          >
            <Text className="text-lg font-bold text-slate-300">←</Text>
          </Pressable>
        )}
        <View>
          <Text className="text-xl font-bold tracking-tight text-white">{title}</Text>
          {subtitle ? (
            <Text className="mt-0.5 text-xs font-medium text-slate-400">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
};

export default ScreenHeader;
