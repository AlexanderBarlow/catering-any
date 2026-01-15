import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { CFA } from "../../constants/theme";
import { http } from "../../src/api/client";
import { useSession } from "../../hooks/useSession";
import { LiquidButton } from "@/components/LiquidButton";

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.glassCard}>
      <BlurView
        intensity={Platform.OS === "ios" ? 10 : 14}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
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
      <View style={styles.glassInner}>{children}</View>
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
    <View style={styles.fieldRow}>
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
        style={styles.fieldInput}
      />
      {right}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn } = useSession();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const contentMaxWidth = isLandscape ? Math.min(980, width - 32) : 520;

  const [email, setEmail] = useState("admin@catering.local");
  const [password, setPassword] = useState("password");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return !!email.trim() && !!password && !loading;
  }, [email, password, loading]);

  const onLogin = useCallback(async () => {
    if (!canSubmit) return;

    setErr("");
    setLoading(true);

    try {
      // ✅ REAL Render API login. Throws on 401/400 because client.ts throws on !res.ok
      const res = await http.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // res: { accessToken, refreshToken, user: { id, email, role, name } }
      const role = String(res?.user?.role || "STAFF").toUpperCase();

      await signIn({
        token: res.accessToken, // ✅ map accessToken -> token used by session.ts + client.ts
        user: {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name ?? "",
          role: role as any,
        },
      });

      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : "Login failed.");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, email, password, signIn]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View pointerEvents="none" style={styles.bgBlobTop} />
      <View pointerEvents="none" style={styles.bgBlobBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.centerWrap, { paddingHorizontal: 16 }]}>
          <View
            style={[
              styles.cardFrame,
              {
                maxWidth: contentMaxWidth,
                width: "100%",
                flexDirection: isLandscape ? "row" : "column",
                alignItems: isLandscape ? "stretch" : "flex-start",
                gap: isLandscape ? 16 : 14,
              },
            ]}
          >
            {/* LEFT / HEADER PANEL */}
            <View
              style={[
                styles.headerPanel,
                {
                  flex: isLandscape ? 1 : 0,
                  padding: isLandscape ? 18 : 0,
                  borderRadius: isLandscape ? 24 : 0,
                  backgroundColor: isLandscape
                    ? "rgba(229,22,54,0.06)"
                    : "transparent",
                  borderWidth: isLandscape ? 1 : 0,
                  borderColor: isLandscape
                    ? "rgba(229,22,54,0.12)"
                    : "transparent",
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={styles.headerIcon}>
                  <Ionicons name="analytics" size={22} color={CFA.red} />
                </View>

                <View style={styles.headerTextWrap}>
                  <Text style={styles.h1}>Catering Analytics</Text>
                  <Text style={styles.subhead}>
                    Sign in to view performance insights
                  </Text>
                </View>
              </View>

              {isLandscape ? (
                <View style={{ marginTop: 14 }}>
                  <View style={styles.bulletRow}>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color={CFA.red}
                    />
                    <Text style={styles.bulletText}>
                      Admin access is validated by your account role.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <Ionicons name="sparkles" size={16} color={CFA.red} />
                    <Text style={styles.bulletText}>
                      Faster workflow + clearer dashboards for managers.
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* RIGHT / FORM */}
            <View style={{ flex: isLandscape ? 1 : 0, width: "100%" }}>
              <GlassCard>
                <Text style={styles.label}>Email</Text>
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

                <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
                <View style={{ marginTop: 8 }}>
                  <FieldRow
                    icon="key"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPw}
                    right={
                      <Pressable
                        onPress={() => setShowPw((v) => !v)}
                        hitSlop={12}
                      >
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
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color={CFA.red} />
                    <Text style={styles.errorText}>{err}</Text>
                  </View>
                ) : null}

                <LiquidButton
                  title={loading ? "Signing in…" : "Sign In"}
                  icon="log-in"
                  onPress={onLogin}
                  disabled={!canSubmit}
                  containerStyle={{ marginTop: 14 }}
                />

                <Text style={styles.footerNote}>
                  Your credentials are validated by the server.
                </Text>
              </GlassCard>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: CFA.cream },

  centerWrap: { flex: 1, justifyContent: "center" },

  cardFrame: {
    alignSelf: "center",
    paddingVertical: 4,
  },

  bgBlobTop: {
    position: "absolute",
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(229,22,54,0.14)",
  },
  bgBlobBottom: {
    position: "absolute",
    bottom: -160,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: "rgba(229,22,54,0.10)",
  },

  headerPanel: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(229,22,54,0.12)",
    borderWidth: 1,
    borderColor: "rgba(229,22,54,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1 },
  h1: { fontSize: 26, fontWeight: "900", color: CFA.ink },
  subhead: { color: CFA.muted, marginTop: 3, fontWeight: "700" },

  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  bulletText: {
    flex: 1,
    color: "rgba(11,18,32,0.70)",
    fontWeight: "800",
  },

  glassCard: {
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
  },
  glassInner: { padding: 18 },

  label: {
    color: CFA.muted,
    fontWeight: "900",
    fontSize: 12,
  },

  fieldRow: {
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
  },
  fieldInput: {
    flex: 1,
    color: CFA.ink,
    fontWeight: "800",
    fontSize: 15,
    paddingVertical: 0,
  },

  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(229,22,54,0.22)",
    backgroundColor: "rgba(229,22,54,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: { color: CFA.red, fontWeight: "900", flex: 1 },

  footerNote: {
    marginTop: 12,
    color: CFA.muted,
    fontSize: 12,
    fontWeight: "700",
  },
});
