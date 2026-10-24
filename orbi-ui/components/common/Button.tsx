import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  textClassName?: string;
  accessibilityLabel?: string;
};

const VARIANT_CONTAINER_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 active:bg-indigo-700 border-indigo-500",
  secondary: "bg-slate-800 active:bg-slate-700 border-slate-700",
  outline: "bg-transparent active:bg-slate-800/50 border-slate-700",
  danger: "bg-rose-600 active:bg-rose-700 border-rose-500",
  ghost: "bg-transparent active:bg-slate-800/30 border-transparent",
};

const VARIANT_TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: "text-white font-semibold",
  secondary: "text-slate-200 font-medium",
  outline: "text-slate-300 font-medium",
  danger: "text-white font-semibold",
  ghost: "text-slate-400 font-medium",
};

const SIZE_CONTAINER_STYLES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 rounded-lg",
  md: "px-4 py-2.5 rounded-xl",
  lg: "px-5 py-3.5 rounded-xl",
};

const SIZE_TEXT_STYLES: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  textClassName = "",
  accessibilityLabel,
}: ButtonProps) => {
  const isActionDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isActionDisabled }}
      disabled={isActionDisabled}
      onPress={onPress}
      className={`flex-row items-center justify-center border ${VARIANT_CONTAINER_STYLES[variant]} ${SIZE_CONTAINER_STYLES[size]} ${
        isActionDisabled ? "opacity-50" : "opacity-100"
      } ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? "#cbd5e1" : "#ffffff"}
        />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leftIcon}
          <Text
            className={`${VARIANT_TEXT_STYLES[variant]} ${SIZE_TEXT_STYLES[size]} ${textClassName}`}
          >
            {title}
          </Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
};

export default Button;
