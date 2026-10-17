import { Pressable, ScrollView, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import type { ToastShowParams } from "react-native-toast-message";

const toastDemos: { label: string; toast: ToastShowParams }[] = [
  {
    label: "Success Toast",
    toast: {
      type: "success",
      text2: "Operation completed successfully.",
    },
  },
  {
    label: "Error Toast",
    toast: {
      type: "error",
      text2: "Something went wrong.",
    },
  },
  {
    label: "Info Toast",
    toast: {
      type: "info",
      text2: "Here is some information.",
    },
  },
  {
    label: "Success with Title and Message",
    toast: {
      type: "success",
      text1: "Saved!",
      text2: "Your changes have been saved successfully.",
    },
  },
  {
    label: "Error with Title and Message",
    toast: {
      type: "error",
      text1: "Upload Failed",
      text2: "Please check your internet connection and try again.",
    },
  },
  {
    label: "Info with Title and Message",
    toast: {
      type: "info",
      text1: "Heads Up",
      text2: "Your session will expire in 5 minutes.",
    },
  },
  {
    label: "Short Duration Toast",
    toast: {
      type: "info",
      text1: "Quick Toast",
      text2: "Visible for 1 second.",
      visibilityTime: 1000,
    },
  },
  {
    label: "Long Duration Toast",
    toast: {
      type: "info",
      text1: "Long Toast",
      text2: "Visible for 8 seconds.",
      visibilityTime: 8000,
    },
  },
  {
    label: "Toast at Top",
    toast: {
      type: "success",
      text1: "Top Position",
      text2: "This toast is shown at the top.",
      position: "top",
    },
  },
  {
    label: "Toast at Bottom",
    toast: {
      type: "info",
      text1: "Bottom Position",
      text2: "This toast is shown at the bottom.",
      position: "bottom",
    },
  },
  {
    label: "Login Successful Toast",
    toast: {
      type: "success",
      text1: "Login Successful",
      text2: "Welcome back! You are now signed in.",
    },
  },
  {
    label: "API Request Failed Toast",
    toast: {
      type: "error",
      text1: "API Request Failed",
      text2: "Could not reach the server. Please try again.",
    },
  },
];

const BUTTON_TONES: Record<string, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

const ToastDemo = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="gap-3 p-4 pb-12">
        <Text className="text-xl font-bold text-slate-900">Toast Demo</Text>
        <Text className="mb-2 text-sm text-slate-500">
          Success = green, Error = red, Info = blue
        </Text>
        {toastDemos.map((demo) => (
          <Pressable
            key={demo.label}
            className={`rounded-lg px-4 py-3 ${
              BUTTON_TONES[demo.toast.type as string] ?? "bg-slate-800"
            }`}
            onPress={() => Toast.show(demo.toast)}
          >
            <Text className="text-center text-base font-semibold text-white">
              {demo.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default ToastDemo;
