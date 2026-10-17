import { BaseToast } from "react-native-toast-message";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";

const TOAST_THEME = {
  success: {
    accent: "#22c55e",
    background: "#f0fdf4",
    title: "#15803d",
  },
  error: {
    accent: "#ef4444",
    background: "#fef2f2",
    title: "#b91c1c",
  },
  info: {
    accent: "#3b82f6",
    background: "#eff6ff",
    title: "#1d4ed8",
  },
};

type ToastTheme = (typeof TOAST_THEME)[keyof typeof TOAST_THEME];

const createToast =
  (theme: ToastTheme) => (props: ToastConfigParams<unknown>) =>
    (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.accent,
          borderLeftWidth: 6,
          backgroundColor: theme.background,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={[
          { fontSize: 15, fontWeight: "700", color: theme.title },
          props.text1Style,
        ]}
        text2Style={[{ fontSize: 13, color: "#334155" }, props.text2Style]}
      />
    );

const toastConfig: ToastConfig = {
  success: createToast(TOAST_THEME.success),
  error: createToast(TOAST_THEME.error),
  info: createToast(TOAST_THEME.info),
};

export default toastConfig;
