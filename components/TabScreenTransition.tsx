import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function TabScreenTransition({
  children,
  style,
  offset = 10,
  duration = 220,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  offset?: number; // how far it slides in from
  duration?: number; // speed
}) {
  const isFocused = useIsFocused();

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      // reset start
      opacity.setValue(0);
      translateY.setValue(offset);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration + 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, duration, offset, opacity, translateY]);

  return (
    <Animated.View
      style={[
        { flex: 1 },
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
