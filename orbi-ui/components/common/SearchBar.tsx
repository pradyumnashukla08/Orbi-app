import { Pressable, Text, TextInput, View } from "react-native";

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
  onPress?: () => void;
  onVoicePress?: () => void;
  isReadOnly?: boolean;
  className?: string;
};

const SearchBar = ({
  placeholder = "Ask Orbi anything...",
  value = "",
  onChangeText,
  onSubmit,
  onPress,
  onVoicePress,
  isReadOnly = false,
  className = "",
}: SearchBarProps) => {
  if (isReadOnly && onPress) {
    return (
      <Pressable
        accessibilityLabel="Search input trigger"
        accessibilityRole="button"
        onPress={onPress}
        className={`flex-row items-center justify-between rounded-2xl border border-orbi-border bg-orbi-card px-4 py-3.5 active:border-orbi-primary/50 ${className}`}
      >
        <View className="flex-row items-center gap-2.5">
          <Text className="text-base text-orbi-primary">✦</Text>
          <Text className="text-sm font-medium text-slate-400">{placeholder}</Text>
        </View>
        <Text className="text-base text-slate-400">🎙️</Text>
      </Pressable>
    );
  }

  return (
    <View
      className={`flex-row items-center justify-between rounded-2xl border border-orbi-border bg-orbi-card px-4 py-2.5 focus:border-orbi-primary ${className}`}
    >
      <View className="flex-1 flex-row items-center gap-2.5">
        <Text className="text-base text-orbi-primary">✦</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          returnKeyType="search"
          accessibilityLabel={placeholder}
          className="flex-1 text-sm font-medium text-white"
        />
      </View>
      {onVoicePress ? (
        <Pressable
          accessibilityLabel="Voice search"
          accessibilityRole="button"
          onPress={onVoicePress}
          className="p-1 active:opacity-70"
        >
          <Text className="text-base text-slate-400">🎙️</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default SearchBar;
