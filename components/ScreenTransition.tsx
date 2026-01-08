import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ScreenTransition({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={[{ flex: 1 }, style]}>
      <Animated.View style={[{ flex: 1 }, aStyle]}>{children}</Animated.View>
    </View>
  );
}
