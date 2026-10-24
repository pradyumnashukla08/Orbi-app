import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Button from "../components/common/Button";

const TRUST_POINTS = [
  {
    id: "control",
    title: "Your data, your control",
    subtitle: "You decide what to save, index, and organize.",
    icon: "🛡️",
  },
  {
    id: "security",
    title: "Stored securely",
    subtitle: "Protected with AES-256 end-to-end encryption.",
    icon: "🔐",
  },
  {
    id: "private",
    title: "Used only for you",
    subtitle: "Never sold, mined, or shared with third parties.",
    icon: "👤",
  },
];

const Permissions = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      Toast.show({
        type: "success",
        text1: "Vault Ready",
        text2: "Your private second brain is fully configured.",
      });
      router.replace("/user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 justify-between"
      >
        <View>
          {/* Top Back Action */}
          <View className="h-12 justify-center pt-2">
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-xl border border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
            >
              <Text className="text-base text-slate-300">←</Text>
            </Pressable>
          </View>

          {/* Central Glowing Shield Graphic */}
          <View className="items-center pb-6 pt-4">
            <View className="h-28 w-28 items-center justify-center rounded-3xl border-2 border-orbi-glow/50 bg-gradient-to-tr from-purple-950 to-indigo-950 shadow-2xl shadow-purple-500/40">
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-purple-950/90 border border-orbi-glow/60">
                <Text className="text-4xl">🔒</Text>
              </View>
            </View>

            <Text className="mt-6 text-2xl font-black tracking-tight text-white text-center">
              Keep Your Data Private
            </Text>
            <Text className="mt-2 text-center text-xs leading-relaxed text-slate-400 max-w-xs">
              Your content stays private and secure. We only access what you explicitly choose to save.
            </Text>
          </View>

          {/* 3 Security Trust Cards */}
          <View className="gap-3 mb-8">
            {TRUST_POINTS.map((point) => (
              <View
                key={point.id}
                className="flex-row items-center gap-3.5 rounded-2xl border border-orbi-border bg-orbi-card p-4"
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-800/60">
                  <Text className="text-xl">{point.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white">{point.title}</Text>
                  <Text className="mt-0.5 text-xs text-slate-400">{point.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <View className="pt-4">
          <Button
            title="Continue →"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onPress={handleContinue}
            className="bg-orbi-primary active:bg-orbi-primaryDark border-orbi-glow shadow-lg shadow-purple-500/30"
            accessibilityLabel="Continue to Second Brain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Permissions;
