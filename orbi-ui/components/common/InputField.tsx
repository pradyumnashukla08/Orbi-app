import { useState } from "react";
import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";

type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  accessibilityLabel?: string;
  className?: string;
};

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  error,
  keyboardType = "default",
  autoCapitalize = "none",
  leftIcon,
  rightAction,
  accessibilityLabel,
  className = "",
}: InputFieldProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <View className={`w-full ${className}`}>
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-slate-300">{label}</Text>
        {rightAction}
      </View>

      <View
        className={`flex-row items-center rounded-2xl border bg-orbi-card px-4 py-3 transition-colors ${
          error
            ? "border-rose-500"
            : isFocused
            ? "border-orbi-primary shadow-sm shadow-purple-500/20"
            : "border-orbi-border"
        }`}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel ?? label}
          className="flex-1 text-sm font-medium text-white"
        />

        {isPassword ? (
          <Pressable
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            accessibilityRole="button"
            onPress={() => setShowPassword(!showPassword)}
            className="p-1 active:opacity-70"
          >
            <Text className="text-base text-slate-400">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="mt-1 text-xs text-rose-400">{error}</Text> : null}
    </View>
  );
};

export default InputField;
