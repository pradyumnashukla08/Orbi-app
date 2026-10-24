import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUserStore } from "../stores/user/useUserStore";

type OnboardingSlide = {
  title: string;
  subtitle: string;
  step: number;
};

const SLIDES: OnboardingSlide[] = [
  {
    step: 0,
    title: "Save Everything That Matters",
    subtitle: "Photos, links, notes, files, ideas — all in one private space.",
  },
  {
    step: 1,
    title: "AI Understands Your Content",
    subtitle: "Automatic summaries, tags and smart organization.",
  },
  {
    step: 2,
    title: "Find Anything Instantly",
    subtitle: "Search in natural language. No more endless scrolling.",
  },
];

const Onboarding = () => {
  const { isAuthenticated, hasHydrated } = useUserStore();
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/user");
    }
  }, [hasHydrated, isAuthenticated]);

  const handleNext = () => {
    if (currentStep < SLIDES.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/signup");
    }
  };

  const handleSkip = () => {
    router.push("/login");
  };

  const slide = SLIDES[currentStep];

  return (
    <SafeAreaView className="flex-1 bg-orbi-bg">
      <View className="flex-1 px-6 justify-between pb-8 pt-2">
        {/* Top Bar: Back & Skip */}
        <View className="flex-row items-center justify-between h-12">
          {currentStep > 0 ? (
            <Pressable
              accessibilityLabel="Previous slide"
              accessibilityRole="button"
              onPress={() => setCurrentStep(currentStep - 1)}
              className="h-10 w-10 items-center justify-center rounded-xl border border-orbi-border bg-orbi-card active:bg-orbi-cardHover"
            >
              <Text className="text-base text-slate-300">←</Text>
            </Pressable>
          ) : (
            <View className="w-10" />
          )}

          <Pressable
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
            onPress={handleSkip}
            className="px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-slate-400">Skip</Text>
          </Pressable>
        </View>

        {/* Center Visual Graphics per Step */}
        <View className="items-center justify-center py-6 min-h-[300px]">
          {currentStep === 0 && (
            /* Step 1 Visual: Floating Stack of Captured Content */
            <View className="relative h-64 w-64 items-center justify-center">
              {/* Back Card (Notes) */}
              <View className="absolute top-2 left-6 h-28 w-40 rounded-2xl border border-emerald-600/30 bg-emerald-950/60 p-3 shadow-lg -rotate-12">
                <Text className="text-lg">📝</Text>
                <Text className="mt-2 text-xs font-bold text-white">Meeting Notes</Text>
                <View className="mt-1 h-1.5 w-16 rounded bg-emerald-400/40" />
              </View>

              {/* Back Card (Media) */}
              <View className="absolute top-4 right-4 h-28 w-36 rounded-2xl border border-indigo-600/30 bg-indigo-950/60 p-3 shadow-lg rotate-12">
                <Text className="text-lg">🖼️</Text>
                <Text className="mt-2 text-xs font-bold text-white">UI Screenshot</Text>
                <View className="mt-1 h-1.5 w-12 rounded bg-indigo-400/40" />
              </View>

              {/* Front Center Card (Links) */}
              <View className="z-10 h-36 w-48 rounded-2xl border border-sky-500/50 bg-gradient-to-b from-[#131b38] to-orbi-card p-4 shadow-xl shadow-sky-500/20">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-950 border border-sky-800">
                  <Text className="text-xl">🔗</Text>
                </View>
                <Text className="mt-3 text-sm font-bold text-white">AI Research Link</Text>
                <Text className="mt-1 text-[11px] text-slate-400">arxiv.org/abs/2602.091</Text>
                <View className="mt-2 flex-row gap-1">
                  <View className="h-1.5 w-8 rounded bg-sky-400" />
                  <View className="h-1.5 w-14 rounded bg-slate-600" />
                </View>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            /* Step 2 Visual: Glowing AI Neural Orb with Radial Nodes */
            <View className="relative h-64 w-64 items-center justify-center">
              {/* Satellite Tag Pills */}
              <View className="absolute top-2 left-8 rounded-full border border-emerald-600/40 bg-emerald-950/80 px-3 py-1">
                <Text className="text-xs font-semibold text-emerald-300">📝 Notes</Text>
              </View>

              <View className="absolute top-2 right-8 rounded-full border border-sky-600/40 bg-sky-950/80 px-3 py-1">
                <Text className="text-xs font-semibold text-sky-300">🔗 Links</Text>
              </View>

              <View className="absolute bottom-6 left-6 rounded-full border border-purple-600/40 bg-purple-950/80 px-3 py-1">
                <Text className="text-xs font-semibold text-purple-300">📁 Files</Text>
              </View>

              <View className="absolute bottom-6 right-6 rounded-full border border-rose-600/40 bg-rose-950/80 px-3 py-1">
                <Text className="text-xs font-semibold text-rose-300">🎙️ Voice</Text>
              </View>

              {/* Central Glowing Orb */}
              <View className="h-32 w-32 items-center justify-center rounded-full border-4 border-orbi-glow/40 bg-gradient-to-tr from-purple-900 to-indigo-900 shadow-2xl shadow-purple-500/50">
                <View className="h-24 w-24 items-center justify-center rounded-full bg-purple-950/90 border border-orbi-glow/60">
                  <Text className="text-3xl animate-pulse">🔮</Text>
                </View>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            /* Step 3 Visual: Natural Language Search Mock */
            <View className="w-full max-w-xs gap-3">
              <View className="rounded-2xl border border-orbi-primary/50 bg-orbi-card p-3.5 flex-row items-center gap-2.5 shadow-lg shadow-purple-950/40">
                <Text className="text-base text-orbi-primary">✦</Text>
                <Text className="text-xs font-semibold text-white flex-1">
                  Find my notes about startup ideas from last month
                </Text>
              </View>

              {/* Simulated Result Cards */}
              <View className="rounded-xl border border-orbi-border bg-orbi-card/80 p-3 flex-row items-center gap-3">
                <Text className="text-base">📄</Text>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-white">Y Combinator Application Draft</Text>
                  <Text className="text-[10px] text-slate-400">Saved in Ideas • Sep 18</Text>
                </View>
                <Text className="text-xs text-slate-500">›</Text>
              </View>

              <View className="rounded-xl border border-orbi-border bg-orbi-card/80 p-3 flex-row items-center gap-3">
                <Text className="text-base">🎙️</Text>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-white">Voice Note: Pitch Structure</Text>
                  <Text className="text-[10px] text-slate-400">Audio memo • Sep 22</Text>
                </View>
                <Text className="text-xs text-slate-500">›</Text>
              </View>
            </View>
          )}
        </View>

        {/* Text Information Block */}
        <View className="items-center px-4">
          <Text className="text-center text-2xl font-black tracking-tight text-white">
            {slide.title}
          </Text>
          <Text className="mt-2.5 max-w-xs text-center text-sm leading-relaxed text-slate-400">
            {slide.subtitle}
          </Text>
        </View>

        {/* Bottom Pagination & Action Button */}
        <View className="mt-8 flex-row items-center justify-between">
          {/* Dot Indicators */}
          <View className="flex-row items-center gap-1.5">
            {SLIDES.map((s) => {
              const isActive = s.step === currentStep;
              return (
                <View
                  key={s.step}
                  className={`h-2 rounded-full transition-all ${
                    isActive ? "w-6 bg-orbi-primary" : "w-2 bg-slate-700"
                  }`}
                />
              );
            })}
          </View>

          {/* Next / Get Started Button */}
          {currentStep === SLIDES.length - 1 ? (
            <Pressable
              accessibilityLabel="Get Started"
              accessibilityRole="button"
              onPress={handleNext}
              className="rounded-full bg-orbi-primary px-6 py-3 shadow-lg shadow-purple-500/40 active:bg-orbi-primaryDark"
            >
              <Text className="text-sm font-bold text-white">Get Started →</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityLabel="Next step"
              accessibilityRole="button"
              onPress={handleNext}
              className="h-12 w-12 items-center justify-center rounded-full bg-orbi-primary shadow-lg shadow-purple-500/40 active:bg-orbi-primaryDark"
            >
              <Text className="text-lg font-bold text-white">→</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding;
