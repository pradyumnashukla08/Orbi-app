import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUserStore } from "../../stores/user/useUserStore";

type CreateCollectionModalProps = {
  visible: boolean;
  onClose: () => void;
};

const PRESET_EMOJIS = ["📁", "💡", "🚀", "📚", "💼", "🎯", "🎨", "🧠", "⚡", "🌟"];

const PRESET_COLORS = [
  { label: "Indigo", hex: "#6366F1" },
  { label: "Purple", hex: "#8B5CF6" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Rose", hex: "#F43F5E" },
];

const CreateCollectionModal = ({ visible, onClose }: CreateCollectionModalProps) => {
  const addCollection = useUserStore((state) => state.addCollection);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [accentColor, setAccentColor] = useState("#6366F1");

  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Toast.show({
        type: "error",
        text1: "Name Required",
        text2: "Please enter a title for your new collection.",
      });
      return;
    }

    const newCollection = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      emoji: emoji || "📁",
      accentColor,
      count: 0,
    };

    addCollection(newCollection);

    Toast.show({
      type: "success",
      text1: "Collection Created",
      text2: `"${trimmedName}" is now ready in your workspace.`,
    });

    // Reset fields & close
    setName("");
    setEmoji("📁");
    setAccentColor("#6366F1");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setEmoji("📁");
    setAccentColor("#6366F1");
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/75 px-5">
        <View className="w-full max-w-sm rounded-3xl border border-orbi-border bg-orbi-card p-6 shadow-2xl shadow-purple-950/40">
          {/* Header */}
          <View className="mb-5 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-white">New Collection</Text>
              <Text className="mt-0.5 text-xs text-slate-400">
                Organize thoughts and memories
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800 active:bg-slate-700"
            >
              <Text className="text-sm font-bold text-slate-400">✕</Text>
            </Pressable>
          </View>

          {/* Live Preview Badge */}
          <View className="mb-5 items-center justify-center">
            <View
              style={{ backgroundColor: `${accentColor}25`, borderColor: `${accentColor}60` }}
              className="h-16 w-16 items-center justify-center rounded-2xl border"
            >
              <Text className="text-3xl">{emoji}</Text>
            </View>
            <Text className="mt-2 text-sm font-semibold text-white">
              {name.trim() || "Collection Name"}
            </Text>
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Collection Name
            </Text>
            <TextInput
              placeholder="e.g. Design Systems, Travel Plans"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
              maxLength={30}
              className="rounded-xl border border-orbi-border bg-orbi-bg px-3.5 py-2.5 text-sm font-medium text-white"
            />
          </View>

          {/* Emoji Selection */}
          <View className="mb-4">
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pick Icon
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {PRESET_EMOJIS.map((item) => {
                const selected = emoji === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setEmoji(item)}
                    className={`mr-2 h-9 w-9 items-center justify-center rounded-xl border ${
                      selected
                        ? "border-orbi-primary bg-orbi-primary/30"
                        : "border-orbi-border bg-orbi-bg active:bg-slate-800"
                    }`}
                  >
                    <Text className="text-base">{item}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Color Selection */}
          <View className="mb-6">
            <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Theme Color
            </Text>
            <View className="flex-row justify-between">
              {PRESET_COLORS.map((c) => {
                const selected = accentColor === c.hex;
                return (
                  <Pressable
                    key={c.hex}
                    onPress={() => setAccentColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-7 w-7 rounded-full items-center justify-center ${
                      selected ? "border-2 border-white" : ""
                    }`}
                  >
                    {selected && <View className="h-2 w-2 rounded-full bg-white" />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row gap-2.5">
            <Pressable
              accessibilityRole="button"
              onPress={handleClose}
              className="flex-1 items-center justify-center rounded-xl border border-orbi-border bg-orbi-bg py-3 active:bg-slate-800"
            >
              <Text className="text-xs font-semibold text-slate-300">Cancel</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleCreate}
              className="flex-1 items-center justify-center rounded-xl bg-orbi-primary py-3 active:bg-orbi-primary/80 shadow-md shadow-indigo-600/30"
            >
              <Text className="text-xs font-bold text-white">Create</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateCollectionModal;
