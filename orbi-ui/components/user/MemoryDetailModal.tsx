import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUserStore } from "../../stores/user/useUserStore";
import type { BrainItem, CaptureType } from "../../stores/user/useUserStore";

type MemoryDetailModalProps = {
  item: BrainItem | null;
  visible: boolean;
  onClose: () => void;
};

const TYPE_CONFIG: Record<CaptureType, { icon: string; label: string; bg: string; border: string }> = {
  note: { icon: "📝", label: "Note", bg: "bg-emerald-950/70", border: "border-emerald-600/40" },
  link: { icon: "🔗", label: "Link", bg: "bg-sky-950/70", border: "border-sky-600/40" },
  image: { icon: "🖼️", label: "Screenshot", bg: "bg-purple-950/70", border: "border-purple-600/40" },
  voice: { icon: "🎙️", label: "Voice", bg: "bg-rose-950/70", border: "border-rose-600/40" },
  file: { icon: "📄", label: "File", bg: "bg-amber-950/70", border: "border-amber-600/40" },
};

const MemoryDetailModal = ({ item, visible, onClose }: MemoryDetailModalProps) => {
  const { editItem, deleteItem, collections } = useUserStore();
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("Ideas");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync state whenever the selected item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setSnippet(item.snippet || "");
      setSelectedCollection(item.collection || "Ideas");
      setConfirmDelete(false);
    }
  }, [item]);

  if (!item) {
    return null;
  }

  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.note;

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Toast.show({
        type: "error",
        text1: "Title Required",
        text2: "Please provide a title for this item.",
      });
      return;
    }

    editItem({
      ...item,
      title: trimmedTitle,
      snippet: snippet.trim(),
      collection: selectedCollection,
    });

    Toast.show({
      type: "success",
      text1: "Memory Updated",
      text2: "Your changes have been saved to Orbi.",
    });

    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    deleteItem(item.id);

    Toast.show({
      type: "info",
      text1: "Memory Removed",
      text2: `"${item.title}" was deleted.`,
    });

    setConfirmDelete(false);
    onClose();
  };

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/75 px-5">
        <View className="w-full max-w-sm rounded-3xl border border-orbi-border bg-orbi-card p-6 shadow-2xl shadow-purple-950/40">
          {/* Top Bar: Type Badge, Timestamp & Close */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className={`flex-row items-center gap-1.5 rounded-lg border px-2.5 py-1 ${config.bg} ${config.border}`}
              >
                <Text className="text-xs">{config.icon}</Text>
                <Text className="text-[11px] font-bold uppercase tracking-wider text-white">
                  {config.label}
                </Text>
              </View>
              <Text className="text-xs text-slate-500">{item.timestamp}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-800 active:bg-slate-700"
            >
              <Text className="text-sm font-bold text-slate-400">✕</Text>
            </Pressable>
          </View>

          {/* Form Scroll Area */}
          <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
            {/* Title Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Title
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Memory title"
                placeholderTextColor="#64748B"
                className="rounded-xl border border-orbi-border bg-orbi-bg px-3.5 py-2.5 text-sm font-semibold text-white"
              />
            </View>

            {/* Snippet / Content Input */}
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Content / Notes
              </Text>
              <TextInput
                value={snippet}
                onChangeText={setSnippet}
                placeholder="Details, key points, thoughts..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="min-h-[90px] rounded-xl border border-orbi-border bg-orbi-bg px-3.5 py-2.5 text-xs font-normal leading-5 text-slate-200"
              />
            </View>

            {/* Collection Picker */}
            <View className="mb-4">
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Collection
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {collections.map((col) => {
                  const selected = selectedCollection.toLowerCase() === col.name.toLowerCase();
                  return (
                    <Pressable
                      key={col.id}
                      onPress={() => setSelectedCollection(col.name)}
                      className={`mr-2 flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                        selected
                          ? "border-orbi-primary bg-orbi-primary"
                          : "border-orbi-border bg-orbi-bg active:bg-slate-800"
                      }`}
                    >
                      <Text className="text-xs">{col.emoji}</Text>
                      <Text
                        className={`text-xs font-semibold ${
                          selected ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {col.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tags Display */}
            {item.tags && item.tags.length > 0 && (
              <View className="mb-4">
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Tags
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <View
                      key={tag}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-0.5"
                    >
                      <Text className="text-[11px] font-medium text-slate-300">#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="mt-4 gap-2">
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={handleClose}
                className="flex-1 items-center justify-center rounded-xl border border-orbi-border bg-orbi-bg py-2.5 active:bg-slate-800"
              >
                <Text className="text-xs font-semibold text-slate-300">Cancel</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={handleSave}
                className="flex-1 items-center justify-center rounded-xl bg-orbi-primary py-2.5 active:bg-orbi-primary/80 shadow-md shadow-indigo-600/30"
              >
                <Text className="text-xs font-bold text-white">Save Changes</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              className={`items-center justify-center rounded-xl border py-2 active:opacity-80 ${
                confirmDelete
                  ? "border-rose-500 bg-rose-600/30"
                  : "border-rose-900/40 bg-rose-950/20"
              }`}
            >
              <Text className="text-xs font-bold text-rose-400">
                {confirmDelete ? "⚠️ Tap Again to Permanently Delete" : "🗑️ Delete Memory"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MemoryDetailModal;
