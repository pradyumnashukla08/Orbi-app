import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/common/SearchBar";
import RecentItemCard from "../../components/user/RecentItemCard";
import MemoryDetailModal from "../../components/user/MemoryDetailModal";
import { useUserStore } from "../../stores/user/useUserStore";
import type { BrainItem, CaptureType } from "../../stores/user/useUserStore";

const FILTER_TABS: { key: "all" | CaptureType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "image", label: "Images" },
  { key: "link", label: "Links" },
  { key: "file", label: "Files" },
  { key: "voice", label: "Voice" },
];

const AISearch = () => {
  const {
    items,
    recentSearches,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    clearRecentSearches,
  } = useUserStore();

  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<BrainItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesQuery =
      searchQuery.trim().length === 0 ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.collection.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setAiAnswer(
        `Based on your saved notes and links, "${searchQuery}" is referenced in your ${
          filteredItems[0]?.collection ?? "Work"
        } collection with key focus on technical architecture and growth milestones.`
      );
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    setAiAnswer(
      `Synthesized AI results for "${term}": Found ${
        items.filter((i) => i.title.toLowerCase().includes(term.toLowerCase())).length
      } matching documents across your second brain.`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
      >
        {/* Header */}
        <View className="pb-3 pt-2">
          <Text className="text-xl font-bold tracking-tight text-white">Find Anything</Text>
          <Text className="mt-0.5 text-xs text-slate-400">
            Natural language search across all your saved notes, links, and audio
          </Text>
        </View>

        {/* Search Input */}
        <View className="mb-4">
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length === 0) setAiAnswer(null);
            }}
            onSubmit={handleSearchSubmit}
            placeholder="e.g. 'that YouTube video about AI tools'"
          />
        </View>

        {/* Filter Pills */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityLabel={`Filter by ${tab.label}`}
                  accessibilityRole="button"
                  onPress={() => setActiveFilter(tab.key)}
                  className={`mr-2 rounded-xl border px-3.5 py-1.5 ${
                    active
                      ? "border-orbi-primary bg-orbi-primary"
                      : "border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
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

        {/* AI Instant Answer Card */}
        {aiAnswer ? (
          <View className="mb-5 rounded-2xl border border-orbi-glow/40 bg-gradient-to-b from-purple-950/40 to-orbi-card p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Text className="text-sm">✨</Text>
              <Text className="text-xs font-bold uppercase tracking-wider text-orbi-glow">
                AI Synthesis
              </Text>
            </View>
            <Text className="text-sm leading-relaxed text-slate-200">{aiAnswer}</Text>
          </View>
        ) : (
          <Pressable
            accessibilityLabel="AI Search & Answers promo"
            accessibilityRole="button"
            onPress={handleSearchSubmit}
            className="mb-5 flex-row items-center justify-between rounded-2xl border border-orbi-border bg-orbi-card p-4 active:border-orbi-primary/40"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-purple-950 border border-purple-800/60">
                <Text className="text-base">✨</Text>
              </View>
              <View>
                <Text className="text-sm font-bold text-white">AI Search & Answers</Text>
                <Text className="text-xs text-slate-400">
                  Get instant answers from your saved content
                </Text>
              </View>
            </View>
            <Text className="text-slate-500">›</Text>
          </Pressable>
        )}

        {/* Search Results or Recent Searches */}
        {searchQuery.trim().length > 0 ? (
          <View>
            <Text className="mb-3 text-sm font-bold text-white">
              Results ({filteredItems.length})
            </Text>
            {filteredItems.length === 0 ? (
              <View className="items-center rounded-2xl border border-orbi-border bg-orbi-card p-8">
                <Text className="text-sm font-semibold text-slate-400">
                  No matching memories found
                </Text>
                <Text className="mt-1 text-xs text-slate-500">
                  Try asking in broader terms or clear filter tags.
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                {filteredItems.map((item) => (
                  <RecentItemCard
                    key={item.id}
                    item={item}
                    onPress={(item) => {
                      setSelectedItem(item);
                      setDetailModalVisible(true);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm font-bold text-white">Recent Searches</Text>
              {recentSearches.length > 0 && (
                <Pressable
                  accessibilityLabel="Clear recent searches"
                  accessibilityRole="button"
                  onPress={clearRecentSearches}
                >
                  <Text className="text-xs font-semibold text-slate-400">Clear</Text>
                </Pressable>
              )}
            </View>

            <View className="gap-2">
              {recentSearches.map((search) => (
                <Pressable
                  key={search}
                  accessibilityLabel={`Search for ${search}`}
                  accessibilityRole="button"
                  onPress={() => handleSelectRecentSearch(search)}
                  className="flex-row items-center justify-between rounded-xl border border-orbi-border/60 bg-orbi-card/80 px-4 py-3 active:bg-orbi-cardHover"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs text-slate-500">🔍</Text>
                    <Text className="text-sm font-medium text-slate-300">{search}</Text>
                  </View>
                  <Text className="text-xs text-slate-500">↗</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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

export default AISearch;
