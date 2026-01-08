import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  View,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CFA } from "../constants/theme";
import { haptic } from "@/src/utils/haptics";

export function LiquidButton({
  title,
  icon,
  onPress,
  disabled,
  containerStyle,
  buttonStyle,
}: {
  title: string;
  icon?: any;
  onPress: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) return;

    // subtle “touch down” feel
    haptic.selection();

    Animated.spring(scale, {
      toValue: 0.965,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
    }).start();
  };

  const handlePress = () => {
    if (disabled) {
      // optional: tell the user “nope”
      // haptic.warning();
      return;
    }

    // confirms the action
    haptic.medium();
    onPress();
  };

  return (
    <View style={containerStyle}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <Animated.View
          style={[
            {
              transform: [{ scale }],
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: CFA.red,
              paddingVertical: 14,
              paddingHorizontal: 16,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,

              shadowColor: CFA.red,
              shadowOpacity: 0.2,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 12 },
              elevation: 10,
            },
            buttonStyle,
          ]}
        >
          {/* sheen */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 18,
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />
          {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
          <Text style={{ color: "#fff", fontWeight: "900" }}>{title}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}
