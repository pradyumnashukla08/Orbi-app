import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
};

const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
}: SkeletonProps) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      accessibilityLabel="Loading skeleton"
      accessibilityRole="none"
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: "#334155",
          opacity: opacityAnim,
        },
      ]}
      className={className}
    />
  );
};

export default Skeleton;
