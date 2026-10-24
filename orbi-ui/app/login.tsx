import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";
import { useUserStore } from "../stores/user/useUserStore";

const Login = () => {
  const { userName, login } = useUserStore();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Credentials",
        text2: "Please enter your email and password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const displayName = userName.trim() || email.split("@")[0] || "User";
      login(displayName, email.trim());

      Toast.show({
        type: "success",
        text1: "Welcome Back",
        text2: `Signed in as ${displayName}.`,
      });
      // Replace stack so user cannot back into login screen
      router.replace("/user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "Google") => {
    login(`${provider} Member`, `${provider.toLowerCase()}@orbi.internal`);
    Toast.show({
      type: "info",
      text1: `${provider} Sign In`,
      text2: `Authenticated with ${provider} SSO.`,
    });
    router.replace("/user");
  };

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6"
      >
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

        {/* Brand Header */}
        <View className="items-center pb-6 pt-4">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-orbi-glow/40 bg-purple-950/70 shadow-lg shadow-purple-500/20">
            <Text className="text-xl font-bold text-orbi-glow">✦</Text>
          </View>
          <Text className="text-sm font-bold uppercase tracking-widest text-orbi-glow">ORBI</Text>
          <Text className="mt-1 text-2xl font-black tracking-tight text-white">Welcome Back</Text>
          <Text className="mt-1 text-xs text-slate-400">Continue to your second brain</Text>
        </View>

        {/* Social SSO Buttons */}
        <View className="gap-3 mb-5">
          <Pressable
            accessibilityLabel="Continue with Google"
            accessibilityRole="button"
            onPress={() => handleSocialLogin("Google")}
            className="flex-row items-center justify-center gap-3 rounded-2xl border border-orbi-border bg-orbi-card px-4 py-3.5 active:bg-orbi-cardHover"
          >
            <Text className="text-base">🌐</Text>
            <Text className="text-sm font-semibold text-white">Continue with Google</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="mb-6 flex-row items-center justify-center gap-3">
          <View className="h-px flex-1 bg-orbi-border" />
          <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider">or</Text>
          <View className="h-px flex-1 bg-orbi-border" />
        </View>

        {/* Credentials Form */}
        <View className="gap-4 mb-6">
          <InputField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
            rightAction={
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Toast.show({
                    type: "info",
                    text1: "Password Reset",
                    text2: "Reset instructions sent to your email.",
                  })
                }
              >
                <Text className="text-xs font-semibold text-orbi-primary">Forgot password?</Text>
              </Pressable>
            }
          />
        </View>

        {/* Sign In CTA Button */}
        <Button
          title="Sign In →"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onPress={handleLogin}
          className="bg-orbi-primary active:bg-orbi-primaryDark border-orbi-glow shadow-lg shadow-purple-500/30"
          accessibilityLabel="Sign in button"
        />

        {/* Footer Link */}
        <View className="mt-8 flex-row items-center justify-center gap-1.5">
          <Text className="text-xs text-slate-400">Don't have an account?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Navigate to sign up"
            onPress={() => router.push("/signup")}
          >
            <Text className="text-xs font-bold text-orbi-glow">Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
