import { Pressable, View } from "react-native";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

const Card = ({ children, className = "", onPress, accessibilityLabel }: CardProps) => {
  const baseClassName = `rounded-2xl border border-slate-800 bg-slate-900/90 p-5 ${className}`;

  if (onPress) {
    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onPress}
        className={`${baseClassName} active:border-slate-700 active:bg-slate-800/90`}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View accessibilityRole="none" className={baseClassName}>
      {children}
    </View>
  );
};

export default Card;
