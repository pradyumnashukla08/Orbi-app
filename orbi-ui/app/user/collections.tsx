import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CollectionCard from "../../components/user/CollectionCard";
import RecentItemCard from "../../components/user/RecentItemCard";
import { useUserStore } from "../../stores/user/useUserStore";
import type { BrainItem, Collection } from "../../stores/user/useUserStore";
import CreateCollectionModal from "../../components/user/CreateCollectionModal";
import MemoryDetailModal from "../../components/user/MemoryDetailModal";

const Collections = () => {
  const { collections, items } = useUserStore();
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BrainItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const activeCollectionObj = collections.find((c) => c.name === selectedCollection);

  const displayedItems =
    selectedCollection === "all"
      ? items
      : items.filter((item) => item.collection.toLowerCase() === selectedCollection.toLowerCase());

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection.name);
    Toast.show({
      type: "info",
      text1: `Collection: ${collection.name}`,
      text2: `Showing ${collection.count} curated items.`,
    });
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
            <Text className="text-xl font-bold tracking-tight text-white">Collections</Text>
            <Text className="mt-0.5 text-xs text-slate-400">Organize your world</Text>
          </View>

          <Pressable
            accessibilityLabel="Add new collection"
            accessibilityRole="button"
            onPress={() => setCreateModalVisible(true)}
            className="h-9 w-9 items-center justify-center rounded-xl border border-orbi-border bg-orbi-card active:border-orbi-primary/40"
          >
            <Text className="text-base font-bold text-white">+</Text>
          </Pressable>
        </View>

        {/* Filter Pills */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedCollection("all")}
              className={`mr-2 rounded-xl border px-3.5 py-1.5 ${
                selectedCollection === "all"
                  ? "border-orbi-primary bg-orbi-primary"
                  : "border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedCollection === "all" ? "text-white" : "text-slate-400"
                }`}
              >
                All
              </Text>
            </Pressable>

            {collections.map((col) => {
              const active = selectedCollection === col.name;
              return (
                <Pressable
                  key={col.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedCollection(col.name)}
                  className={`mr-2 flex-row items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                    active
                      ? "border-orbi-primary bg-orbi-primary"
                      : "border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
                  }`}
                >
                  <Text className="text-xs">{col.emoji}</Text>
                  <Text
                    className={`text-xs font-semibold ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {col.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Grid of Collection Cards */}
        {selectedCollection === "all" ? (
          <View className="flex-row flex-wrap gap-3">
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                onPress={handleSelectCollection}
              />
            ))}
          </View>
        ) : (
          <View>
            <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-orbi-border bg-orbi-card p-4">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl">{activeCollectionObj?.emoji}</Text>
                <View>
                  <Text className="text-base font-bold text-white">
                    {activeCollectionObj?.name}
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {activeCollectionObj?.count} curated memory items
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedCollection("all")}
                className="rounded-lg bg-slate-800 px-2.5 py-1"
              >
                <Text className="text-xs font-medium text-slate-300">View Grid</Text>
              </Pressable>
            </View>

            <View className="gap-2.5">
              {displayedItems.length === 0 ? (
                <View className="items-center rounded-2xl border border-orbi-border bg-orbi-card p-8">
                  <Text className="text-sm font-semibold text-slate-400">
                    No items in {activeCollectionObj?.name} yet
                  </Text>
                  <Text className="mt-1 text-xs text-slate-500">
                    Use the Capture tab (+) to add thoughts to this collection.
                  </Text>
                </View>
              ) : (
                displayedItems.map((item) => (
                  <RecentItemCard
                    key={item.id}
                    item={item}
                    onPress={(item) => {
                      setSelectedItem(item);
                      setDetailModalVisible(true);
                    }}
                  />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />

      {/* Memory Detail & Edit/Delete Modal */}
      <MemoryDetailModal
        visible={detailModalVisible}
        item={selectedItem}
        onClose={() => setDetailModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Collections;
