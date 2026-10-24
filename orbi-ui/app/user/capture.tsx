import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Button from "../../components/common/Button";
import { useUserStore } from "../../stores/user/useUserStore";
import type { CaptureType } from "../../stores/user/useUserStore";

const CAPTURE_MODES: { type: CaptureType; label: string; icon: string; color: string }[] = [
  { type: "image", label: "Screenshot", icon: "📸", color: "#818cf8" },
  { type: "link", label: "Link", icon: "🔗", color: "#38bdf8" },
  { type: "note", label: "Note", icon: "📝", color: "#34d399" },
  { type: "file", label: "File", icon: "📁", color: "#fbbf24" },
  { type: "voice", label: "Voice", icon: "🎙️", color: "#f87171" },
];

const Capture = () => {
  const { addItem, collections } = useUserStore();
  const [selectedType, setSelectedType] = useState<CaptureType>("note");
  const [title, setTitle] = useState<string>("");
  const [snippet, setSnippet] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>(collections[0]?.name ?? "Ideas");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCapture = async () => {
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please enter a title or thought to capture.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate intelligent AI summarization & organization delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      addItem({
        title: title.trim(),
        type: selectedType,
        snippet: snippet.trim() || `Auto-indexed under ${selectedCollection}`,
        collection: selectedCollection,
        tags: ["smart-capture", selectedType.toLowerCase()],
      });

      Toast.show({
        type: "success",
        text1: "Captured Successfully",
        text2: `Saved into ${selectedCollection} with auto-generated AI tags.`,
      });

      setTitle("");
      setSnippet("");
      router.push("/user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pb-4 pt-2">
          <View>
            <Text className="text-xl font-bold tracking-tight text-white">Capture Anything</Text>
            <Text className="mt-0.5 text-xs text-slate-400">Save from anywhere, anytime</Text>
          </View>

          <Pressable
            accessibilityLabel="Close capture"
            accessibilityRole="button"
            onPress={() => router.push("/user")}
            className="h-9 w-9 items-center justify-center rounded-full border border-orbi-border bg-orbi-card"
          >
            <Text className="text-sm font-bold text-slate-400">✕</Text>
          </Pressable>
        </View>

        {/* Capture Type Selector Grid */}
        <View className="mb-6 flex-row flex-wrap justify-between gap-2.5">
          {CAPTURE_MODES.map((mode) => {
            const isSelected = selectedType === mode.type;
            return (
              <Pressable
                key={mode.type}
                accessibilityLabel={`Select capture type ${mode.label}`}
                accessibilityRole="button"
                onPress={() => setSelectedType(mode.type)}
                className={`flex-1 min-w-[30%] items-center rounded-2xl border p-3.5 ${
                  isSelected
                    ? "border-orbi-primary bg-orbi-primary/20"
                    : "border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
                }`}
              >
                <Text className="text-2xl mb-1">{mode.icon}</Text>
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-400"
                  }`}
                >
                  {mode.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Capture Form Input */}
        <View className="mb-6 rounded-2xl border border-orbi-border bg-orbi-card p-4 gap-3.5">
          <View>
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Title / Thought
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What are you capturing?"
              placeholderTextColor="#64748b"
              accessibilityLabel="Capture title"
              className="rounded-xl border border-orbi-border bg-orbi-bg px-3.5 py-2.5 text-sm font-medium text-white"
            />
          </View>

          <View>
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Details / Link / Notes
            </Text>
            <TextInput
              value={snippet}
              onChangeText={setSnippet}
              placeholder="Paste content, URL, or type context..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              accessibilityLabel="Capture details"
              className="rounded-xl border border-orbi-border bg-orbi-bg px-3.5 py-2.5 text-sm font-medium text-white"
            />
          </View>

          {/* Collection Target Selector */}
          <View>
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Save To Collection
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {collections.map((col) => {
                const isSelected = selectedCollection === col.name;
                return (
                  <Pressable
                    key={col.id}
                    onPress={() => setSelectedCollection(col.name)}
                    className={`mr-2 flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                      isSelected
                        ? "border-orbi-primary bg-orbi-primary/30"
                        : "border-orbi-border bg-orbi-bg active:bg-orbi-cardHover"
                    }`}
                  >
                    <Text className="text-sm">{col.emoji}</Text>
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {col.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Big Central Tap to Capture CTA Button */}
        <View className="mb-6 items-center">
          <Pressable
            accessibilityLabel="Tap to capture button"
            accessibilityRole="button"
            onPress={handleCapture}
            disabled={isSubmitting}
            className="h-24 w-24 items-center justify-center rounded-full border-4 border-orbi-primary/30 bg-gradient-to-tr from-orbi-primary to-orbi-glow shadow-xl shadow-purple-500/50 active:scale-95"
          >
            <Text className="text-3xl text-white">✨</Text>
            <Text className="text-[10px] font-bold text-white uppercase mt-0.5">Capture</Text>
          </Pressable>
          <Text className="mt-3 text-xs font-medium text-slate-400">
            Tap to capture or save to your knowledge graph
          </Text>
        </View>

        {/* Smart Capture Feature Banner */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-orbi-border bg-orbi-card p-3.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-purple-950 border border-purple-800/60">
            <Text className="text-base">⚡</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold text-white">Smart Auto-Capture</Text>
            <Text className="text-[11px] text-slate-400">
              Auto-organize • AI summaries • Intelligent tagging
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Capture;
