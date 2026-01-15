import React, { useEffect, useMemo, useRef, useState } from "react";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { CFA } from "../../constants/theme";
import { useSession } from "../../hooks/useSession";
import { haptic } from "@/src/utils/haptics";

function iconForRoute(routeName: string, focused: boolean) {
  switch (routeName) {
    case "index":
      return focused ? "grid" : "grid-outline";
    case "operations":
      return focused ? "timer" : "timer-outline";
    case "items":
      return focused ? "fast-food" : "fast-food-outline";
    default:
      return focused ? "people" : "people-outline";
  }
}

function IOS26TabBar(props: BottomTabBarProps & { isAdmin: boolean }) {
  const insets = useSafeAreaInsets();
  const { state, descriptors, navigation, isAdmin } = props;

  const visibleRoutes = useMemo(
    () => state.routes.filter((r) => (r.name === "users" ? isAdmin : true)),
    [state.routes, isAdmin]
  );

  const bottom = (Platform.OS === "ios" ? 12 : 10) + insets.bottom;

  // ---- Layout math (THIS is the fix)
  const H_PAD = 14; // must match the row paddingHorizontal
  const PILL_SIDE_INSET = 8; // pill inset inside each slot (makes it “liquid”)
  const [barWidth, setBarWidth] = useState(0);

  const itemCount = Math.max(1, visibleRoutes.length);
  const trackW = Math.max(0, barWidth - H_PAD * 2);
  const slotW = itemCount > 0 ? trackW / itemCount : 0;
  const pillW = Math.max(0, slotW - PILL_SIDE_INSET * 2);

  // Active index in visible routes
  const visibleIndex = useMemo(() => {
    const activeKey = state.routes[state.index]?.key;
    const idx = visibleRoutes.findIndex((r) => r.key === activeKey);
    return idx >= 0 ? idx : 0;
  }, [state.index, state.routes, visibleRoutes]);

  // Animated X
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!barWidth || !slotW) return;

    // Center pill inside the slot, and account for H_PAD
    const targetX = H_PAD + visibleIndex * slotW + (slotW - pillW) / 2;

    Animated.spring(x, {
      toValue: targetX,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();
  }, [barWidth, slotW, pillW, visibleIndex, x]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom,
        alignItems: "center",
      }}
    >
      <View
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        style={{
          width: 330,
          maxWidth: "90%",
          height: 80,
          borderRadius: 40,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12,
          backgroundColor: "#FFFFFF",
        }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 6 : 10}
          tint="light"
          style={{ flex: 1 }}
        >
          {/* Solid white tint */}
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                Platform.OS === "ios"
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.94)",
            }}
          />

          {/* Top sheen */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 18,
              backgroundColor: "rgba(255,255,255,0.35)",
            }}
          />

          {/* Sliding active pill */}
          {barWidth > 0 && slotW > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 9,
                left: 0,
                width: pillW,
                height: 62,
                transform: [{ translateX: x }],
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 28,
                  overflow: "hidden",
                  backgroundColor: "rgba(229,22,54,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(229,22,54,0.18)",
                  shadowColor: CFA.red,
                  shadowOpacity: 0.12,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 18,
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                />
              </View>
            </Animated.View>
          ) : null}

          {/* Tab buttons */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: H_PAD,
              paddingVertical: 8,
            }}
          >
            {visibleRoutes.map((route) => {
              const options = descriptors[route.key]?.options ?? {};
              const label =
                options.tabBarLabel?.toString?.() ??
                options.title?.toString?.() ??
                route.name;

              const isFocused = state.routes[state.index]?.key === route.key;
              const iconName = iconForRoute(route.name, isFocused) as any;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                // HAPTIC: only when actually switching tabs
                if (!isFocused && !event.defaultPrevented) {
                  haptic.selection();
                  navigation.navigate(route.name as never);
                }
              };

              const onLongPress = () => {
                // HAPTIC: subtle long-press feedback
                haptic.light();
                navigation.emit({ type: "tabLongPress", target: route.key });
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={{
                    width: slotW,
                    height: 62,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Ionicons
                    name={iconName}
                    size={30}
                    color={isFocused ? CFA.red : "rgba(11,18,32,0.78)"}
                    style={
                      isFocused
                        ? {
                            textShadowColor: "rgba(229,22,54,0.25)",
                            textShadowRadius: 6,
                          }
                        : undefined
                    }
                  />

                  {isFocused ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        fontWeight: "900",
                        color: CFA.red,
                      }}
                      numberOfLines={1}
                    >
                      {label === "index" ? "Dashboard" : label}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const sessionHook = useSession() as any;
  const user = sessionHook?.user ?? sessionHook?.session?.user ?? null;
  const role = String(user?.role || "").toUpperCase();

  const isAdmin = role === "ADMIN";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <IOS26TabBar {...props} isAdmin={isAdmin} />}
    >
      <Tabs.Screen name="index" options={{ title: "Dash" }} />
      <Tabs.Screen name="operations" options={{ title: "Ops" }} />
      <Tabs.Screen name="items" options={{ title: "Items" }} />
      <Tabs.Screen name="users" options={{ title: "Users" }} />
    </Tabs>
  );
}

