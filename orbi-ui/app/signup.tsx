import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";
import { useUserStore } from "../stores/user/useUserStore";

const SignUp = () => {
  const { userName, login } = useUserStore();
  const [fullName, setFullName] = useState<string>(userName || "");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in all fields to create your account.",
      });
      return;
    }

    if (!agreedToTerms) {
      Toast.show({
        type: "error",
        text1: "Terms Required",
        text2: "Please accept the Terms of Service to continue.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // Store session and authentication flag
      login(fullName.trim(), email.trim());
      Toast.show({
        type: "success",
        text1: "Account Created",
        text2: `Welcome to Orbi, ${fullName.trim().split(" ")[0]}!`,
      });
      // Route to Permissions & Trust onboarding step (Screen 07)
      router.push("/permissions");
    } finally {
      setIsLoading(false);
    }
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
        <View className="items-center pb-5 pt-3">
          <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl border border-orbi-glow/40 bg-purple-950/70 shadow-lg shadow-purple-500/20">
            <Text className="text-xl font-bold text-orbi-glow">✦</Text>
          </View>
          <Text className="text-sm font-bold uppercase tracking-widest text-orbi-glow">ORBI</Text>
          <Text className="mt-1 text-2xl font-black tracking-tight text-white">Create Your Account</Text>
          <Text className="mt-1 text-xs text-slate-400">Start building your second brain</Text>
        </View>

        {/* Social SSO Buttons */}
        <View className="gap-3 mb-5">
          <Pressable
            accessibilityLabel="Continue with Google"
            accessibilityRole="button"
            onPress={() => {
              login("Google Member", "google.member@orbi.internal");
              router.push("/permissions");
            }}
            className="flex-row items-center justify-center gap-3 rounded-2xl border border-orbi-border bg-orbi-card px-4 py-3.5 active:bg-orbi-cardHover"
          >
            <Text className="text-base">🌐</Text>
            <Text className="text-sm font-semibold text-white">Continue with Google</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View className="mb-5 flex-row items-center justify-center gap-3">
          <View className="h-px flex-1 bg-orbi-border" />
          <Text className="text-xs font-medium text-slate-500 uppercase tracking-wider">or</Text>
          <View className="h-px flex-1 bg-orbi-border" />
        </View>

        {/* Registration Form */}
        <View className="gap-3.5 mb-5">
          <InputField
            label="Full name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <InputField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            label="Password"
            placeholder="Create a secure password"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />
        </View>

        {/* Terms Agreement Checkbox */}
        <Pressable
          accessibilityLabel="Agree to Terms of Service and Privacy Policy"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToTerms }}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          className="mb-6 flex-row items-start gap-3"
        >
          <View
            className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
              agreedToTerms ? "border-orbi-primary bg-orbi-primary" : "border-slate-600 bg-orbi-card"
            }`}
          >
            {agreedToTerms && <Text className="text-xs font-bold text-white">✓</Text>}
          </View>
          <Text className="flex-1 text-xs leading-relaxed text-slate-300">
            I agree to the <Text className="font-semibold text-orbi-glow">Terms of Service</Text> and{" "}
            <Text className="font-semibold text-orbi-glow">Privacy Policy</Text>
          </Text>
        </Pressable>

        {/* Create Account CTA Button */}
        <Button
          title="Create Account →"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          onPress={handleSignUp}
          className="bg-orbi-primary active:bg-orbi-primaryDark border-orbi-glow shadow-lg shadow-purple-500/30"
          accessibilityLabel="Create Account button"
        />

        {/* Footer Link */}
        <View className="mt-7 flex-row items-center justify-center gap-1.5">
          <Text className="text-xs text-slate-400">Already have an account?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Navigate to sign in"
            onPress={() => router.push("/login")}
          >
            <Text className="text-xs font-bold text-orbi-glow">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
