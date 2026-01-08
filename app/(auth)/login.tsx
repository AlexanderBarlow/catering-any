import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { CFA } from "../../constants/theme";
import { api } from "../../src/api";
import { useSession } from "../../hooks/useSession";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        borderRadius: 26,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
        elevation: 10,
      }}
    >
      {/* Blur background only */}
      <BlurView
        intensity={Platform.OS === "ios" ? 10 : 14}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />

      {/* White tint ABOVE blur (definition) */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor:
              Platform.OS === "ios"
                ? "rgba(255,255,255,0.94)"
                : "rgba(255,255,255,0.96)",
          },
        ]}
      />

      {/* CONTENT LAYER */}
      <View style={{ padding: 18 }}>{children}</View>
    </View>
  );
}

function FieldRow({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  right,
}: {
  icon: any;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1.2,
        borderColor: "rgba(11,18,32,0.14)",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: "rgba(11,18,32,0.045)",
        minHeight: 52,
      }}
    >
      <Ionicons name={icon} size={18} color={CFA.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(11,18,32,0.45)"
        autoCorrect={false}
        autoCapitalize="none"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        selectionColor={CFA.red}
        cursorColor={CFA.red as any}
        style={{
          flex: 1,
          color: CFA.ink,
          fontWeight: "800",
          fontSize: 15,
          paddingVertical: 0,
        }}
      />
      {right}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn } = useSession();

  const [email, setEmail] = useState("admin@catering.local");
  const [password, setPassword] = useState("password");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password && !loading;
  }, [email, password, loading]);

  async function onLogin() {
    if (!canSubmit) return;

    setErr("");
    setLoading(true);
    try {
      const session = await api.login(email.trim(), password);
      await signIn(session);
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: CFA.cream }}
      edges={["top", "left", "right"]}
    >
      {/* background accents */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -120,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: 999,
          backgroundColor: "rgba(229,22,54,0.14)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -160,
          right: -120,
          width: 340,
          height: 340,
          borderRadius: 999,
          backgroundColor: "rgba(229,22,54,0.10)",
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, padding: 18, justifyContent: "center" }}>
          {/* header */}
          <View style={{ marginBottom: 14 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "rgba(229,22,54,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(229,22,54,0.20)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="analytics" size={22} color={CFA.red} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 26, fontWeight: "900", color: CFA.ink }}
                >
                  Catering Analytics
                </Text>
                <Text
                  style={{ color: CFA.muted, marginTop: 3, fontWeight: "700" }}
                >
                  Sign in to view performance insights
                </Text>
              </View>
            </View>
          </View>

          <GlassCard>
            {/* ✅ remove extra padding wrapper — GlassCard already pads */}
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              Email
            </Text>

            <View style={{ marginTop: 8 }}>
              <FieldRow
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="you@catering.local"
                keyboardType="email-address"
                right={
                  email ? (
                    <Pressable onPress={() => setEmail("")} hitSlop={12}>
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={CFA.muted}
                      />
                    </Pressable>
                  ) : null
                }
              />
            </View>

            <Text
              style={{
                marginTop: 14,
                color: CFA.muted,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              Password
            </Text>

            <View style={{ marginTop: 8 }}>
              <FieldRow
                icon="key"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPw}
                right={
                  <Pressable onPress={() => setShowPw((v) => !v)} hitSlop={12}>
                    <Ionicons
                      name={showPw ? "eye-off" : "eye"}
                      size={18}
                      color={CFA.muted}
                    />
                  </Pressable>
                }
              />
            </View>

            {err ? (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(229,22,54,0.22)",
                  backgroundColor: "rgba(229,22,54,0.06)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Ionicons name="alert-circle" size={18} color={CFA.red} />
                <Text style={{ color: CFA.red, fontWeight: "900", flex: 1 }}>
                  {err}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={onLogin}
              disabled={!canSubmit}
              style={{
                marginTop: 16,
                backgroundColor: CFA.red,
                paddingVertical: 14,
                borderRadius: 18,
                alignItems: "center",
                opacity: canSubmit ? 1 : 0.65,
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    Signing in…
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-in" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    Sign In
                  </Text>
                </>
              )}
            </Pressable>

            <Text style={{ marginTop: 12, color: CFA.muted, fontSize: 12 }}>
              Tip: use an email containing{" "}
              <Text style={{ fontWeight: "900", color: CFA.ink }}>admin</Text>{" "}
              to unlock the Users tab.
            </Text>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
