import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CaptureType = "note" | "link" | "image" | "voice" | "file";

export type BrainItem = {
  id: string;
  title: string;
  type: CaptureType;
  snippet: string;
  timestamp: string;
  collection: string;
  tags: string[];
};

export type Collection = {
  id: string;
  name: string;
  count: number;
  emoji: string;
  accentColor: string;
};

export type UserState = {
  isAuthenticated: boolean;
  hasHydrated: boolean;
  userName: string;
  userEmail: string;
  plan: string;
  items: BrainItem[];
  collections: Collection[];
  recentSearches: string[];
  searchQuery: string;
  activeFilter: "all" | CaptureType;
  aiProcessedCount: number;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
  login: (name?: string, email?: string) => void;
  logout: () => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: "all" | CaptureType) => void;
  addItem: (item: Omit<BrainItem, "id" | "timestamp">) => void;
  removeRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  setUserProfile: (name: string, email: string) => void;
  editItem: (updatedItem: BrainItem) => void;
  deleteItem: (id: string) => void;
  addCollection: (newCollection: Collection) => void;
};

const INITIAL_ITEMS: BrainItem[] = [
  {
    id: "item-1",
    title: "IIT Bombay Event & Keynote Notes",
    type: "note",
    snippet: "Discussion on scaling distributed agent systems and LLM inference pipelines.",
    timestamp: "10 mins ago",
    collection: "Learning",
    tags: ["tech", "ai", "notes"],
  },
  {
    id: "item-2",
    title: "Startup Funding & Equity Article",
    type: "link",
    snippet: "techcrunch.com/articles/series-a-benchmarks-2026",
    timestamp: "2 hours ago",
    collection: "Work",
    tags: ["finance", "startups"],
  },
  {
    id: "item-3",
    title: "Mobile Second Brain UI Inspiration",
    type: "image",
    snippet: "Figma screenshots with dark cosmic palette and glowing glassmorphism.",
    timestamp: "5 hours ago",
    collection: "Ideas",
    tags: ["design", "ui", "inspiration"],
  },
  {
    id: "item-4",
    title: "Q4 Core Architecture Roadmap",
    type: "file",
    snippet: "Architecture_V2_Spec.pdf • 2.4 MB",
    timestamp: "1 day ago",
    collection: "Work",
    tags: ["specs", "docs"],
  },
  {
    id: "item-5",
    title: "Voice Memo: AI Query Agent Idea",
    type: "voice",
    snippet: "Audio memo • 1:42 mins • Transcribed with 98% accuracy",
    timestamp: "2 days ago",
    collection: "Ideas",
    tags: ["voice", "ideas"],
  },
];

const INITIAL_COLLECTIONS: Collection[] = [
  { id: "col-1", name: "Work", count: 128, emoji: "💼", accentColor: "#6366f1" },
  { id: "col-2", name: "Personal", count: 96, emoji: "🌿", accentColor: "#ec4899" },
  { id: "col-3", name: "Ideas", count: 74, emoji: "💡", accentColor: "#f59e0b" },
  { id: "col-4", name: "Learning", count: 112, emoji: "📚", accentColor: "#3b82f6" },
  { id: "col-5", name: "Finance", count: 38, emoji: "📊", accentColor: "#10b981" },
  { id: "col-6", name: "Travel", count: 61, emoji: "✈️", accentColor: "#06b6d4" },
];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      hasHydrated: false,
      userName: "",
      userEmail: "",
      plan: "Free Plan",
      items: INITIAL_ITEMS,
      collections: INITIAL_COLLECTIONS,
      recentSearches: [
        "startup ideas",
        "design inspiration",
        "travel plan",
        "resume pdf",
      ],
      searchQuery: "",
      activeFilter: "all",
      aiProcessedCount: 12,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      login: (name, email) =>
        set((state) => ({
          isAuthenticated: true,
          userName: name !== undefined ? name : state.userName,
          userEmail: email !== undefined ? email : state.userEmail,
        })),

      logout: () =>
        set({
          isAuthenticated: false,
          userName: "",
          userEmail: "",
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      setUserProfile: (name, email) => set({ userName: name, userEmail: email }),

      addItem: (newItem) =>
        set((state) => ({
          items: [
            {
              ...newItem,
              id: `item-${Date.now()}`,
              timestamp: "Just now",
            },
            ...state.items,
          ],
          aiProcessedCount: state.aiProcessedCount + 1,
        })),

      removeRecentSearch: (searchToRemove) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s !== searchToRemove),
        })),

      clearRecentSearches: () => set({ recentSearches: [] }),

      // New actions for editing and deleting items
      editItem: (updatedItem: BrainItem) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === updatedItem.id ? { ...it, ...updatedItem } : it)),
        })),

      deleteItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        })),

      // New action for adding a collection
      addCollection: (newCollection: Collection) =>
        set((state) => ({
          collections: [newCollection, ...state.collections],
        })),
    }),
    {
      name: "orbi-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userName: state.userName,
        userEmail: state.userEmail,
        items: state.items,
        collections: state.collections,
        recentSearches: state.recentSearches,
        plan: state.plan,
        aiProcessedCount: state.aiProcessedCount,
      }),
    }
  )
);
