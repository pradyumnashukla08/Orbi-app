import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { useUserStore } from "../../stores/user/useUserStore";

const UserLayout = () => {
  const { isAuthenticated, hasHydrated } = useUserStore();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#080614",
          borderTopColor: "#262047",
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#a855f7",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: "",
          tabBarIcon: () => (
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full border-2 border-orbi-bg bg-orbi-primary shadow-lg">
              <Text className="text-2xl font-bold leading-none text-white">+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>🗂️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 18, color }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
};

export default UserLayout;
