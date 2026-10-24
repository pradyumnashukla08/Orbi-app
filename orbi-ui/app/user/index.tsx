import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import SearchBar from "../../components/common/SearchBar";
import RecentItemCard from "../../components/user/RecentItemCard";
import MemoryDetailModal from "../../components/user/MemoryDetailModal";
import type { BrainItem } from "../../stores/user/useUserStore";
import { useUserStore } from "../../stores/user/useUserStore";
import type { CaptureType } from "../../stores/user/useUserStore";

const QUICK_ACTIONS: { type: CaptureType; label: string; icon: string; bg: string; border: string }[] = [
  { type: "image", label: "Screenshot", icon: "📸", bg: "bg-indigo-950/70", border: "border-indigo-600/40" },
  { type: "link", label: "Link", icon: "🔗", bg: "bg-sky-950/70", border: "border-sky-600/40" },
  { type: "note", label: "Note", icon: "📝", bg: "bg-emerald-950/70", border: "border-emerald-600/40" },
  { type: "voice", label: "Voice", icon: "🎙️", bg: "bg-rose-950/70", border: "border-rose-600/40" },
];

const Home = () => {
  const [selectedItem, setSelectedItem] = useState<BrainItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { userName, items, aiProcessedCount, addItem, isAuthenticated, hasHydrated } = useUserStore();

  // 1. Route Protection: If logged out, redirect out of user workspace
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated]);

  // 2. Hardware Back Button: Exits the app when pressed on Home Screen
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true; // Prevents navigating back to Starter or Auth screens
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const handleQuickCapture = (type: CaptureType, label: string) => {
    addItem({
      title: `Quick ${label} Entry`,
      type,
      snippet: `Captured via quick action on ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
      collection: "Ideas",
      tags: ["quick", type],
    });

    Toast.show({
      type: "success",
      text1: `${label} Captured`,
      text2: "AI is analyzing and organizing in the background.",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        {/* Top Header & Greeting */}
        <View className="flex-row items-center justify-between pb-4 pt-2">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Welcome Back
            </Text>
            <Text className="text-xl font-bold tracking-tight text-white">
              {userName.trim() ? `Good Morning, ${userName.trim().split(" ")[0]} 👋` : "Good Morning 👋"}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="View profile"
            accessibilityRole="button"
            onPress={() => router.push("/user/profile")}
            className="h-10 w-10 items-center justify-center rounded-full border border-orbi-primary/40 bg-orbi-card"
          >
            <Text className="text-sm font-bold text-orbi-glow">
              {userName.trim() ? userName.trim().charAt(0).toUpperCase() : "👤"}
            </Text>
          </Pressable>
        </View>

        {/* Search Bar - Pressable link to AI Search */}
        <View className="mb-5">
          <SearchBar
            isReadOnly={true}
            placeholder="Ask Orbi anything..."
            onPress={() => router.push("/user/search")}
          />
        </View>

        {/* Quick Capture Pill Actions */}
        <View className="mb-6 flex-row justify-between gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.type}
              accessibilityLabel={`Capture ${action.label}`}
              accessibilityRole="button"
              onPress={() => handleQuickCapture(action.type, action.label)}
              className={`flex-1 items-center rounded-2xl border p-3 ${action.bg} ${action.border} active:opacity-75`}
            >
              <Text className="text-xl mb-1">{action.icon}</Text>
              <Text className="text-xs font-semibold text-white">{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* AI Organizer Banner with Glowing Orb */}
        <View className="mb-6 overflow-hidden rounded-2xl border border-orbi-border bg-gradient-to-r from-orbi-card to-[#1d163d] p-4 shadow-lg shadow-purple-950/30">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="mb-1.5 flex-row items-center gap-1.5">
                <View className="h-2 w-2 rounded-full bg-orbi-glow animate-pulse" />
                <Text className="text-[11px] font-bold uppercase tracking-wider text-orbi-glow">
                  Auto-Organization Engine
                </Text>
              </View>
              <Text className="text-sm font-bold text-white">
                AI is organizing your new items...
              </Text>
              <Text className="mt-1 text-xs text-slate-400">
                {aiProcessedCount} items processed & indexed in your knowledge graph.
              </Text>
            </View>

            {/* Glowing Orb Graphic */}
            <View className="h-14 w-14 items-center justify-center rounded-full border border-orbi-glow/40 bg-purple-950/80 shadow-md shadow-purple-500/30">
              <Text className="text-2xl">🔮</Text>
            </View>
          </View>
        </View>

        {/* Recent Items Section */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-base font-bold text-white">Recent</Text>
          <Pressable
            accessibilityLabel="See all collections"
            accessibilityRole="button"
            onPress={() => router.push("/user/collections")}
          >
            <Text className="text-xs font-semibold text-orbi-primary">See all</Text>
          </Pressable>
        </View>

        <View className="gap-2.5">
          {items.map((item) => (
            <RecentItemCard
              key={item.id}
              item={item}
              onPress={(selected) => {
                setSelectedItem(selected);
                setDetailModalVisible(true);
              }}
            />
          ))}
        </View>
      </ScrollView>
      {/* Memory Detail & Edit/Delete Modal */}
      <MemoryDetailModal
        visible={detailModalVisible}
        item={selectedItem}
        onClose={() => setDetailModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Home;
