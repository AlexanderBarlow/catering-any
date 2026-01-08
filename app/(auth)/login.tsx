import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { CFA } from "../../constants/theme";
import { api } from "../../src/api";
import { useSession } from "../../hooks/useSession";

export default function LoginScreen() {
  const { signIn } = useSession();

  const [email, setEmail] = useState("admin@catering.local");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onLogin() {
    setErr("");
    setLoading(true);
    try {
      const session = await api.login(email.trim(), password);
      await signIn(session);

      // Go to tabs after successful auth
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, padding: 18, justifyContent: "center" }}>
          <View
            style={{
              backgroundColor: CFA.card,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: CFA.border,
              padding: 18,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "900", color: CFA.ink }}>
              Catering Analytics
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 6 }}>
              Sign in to view performance insights
            </Text>

            <Text
              style={{
                marginTop: 16,
                color: CFA.muted,
                fontWeight: "800",
                fontSize: 12,
              }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: CFA.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: "rgba(11,18,32,0.02)",
                color: CFA.ink,
              }}
            />

            <Text
              style={{
                marginTop: 12,
                color: CFA.muted,
                fontWeight: "800",
                fontSize: 12,
              }}
            >
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                marginTop: 8,
                borderWidth: 1,
                borderColor: CFA.border,
                borderRadius: 14,
                padding: 12,
                backgroundColor: "rgba(11,18,32,0.02)",
                color: CFA.ink,
              }}
            />

            {err ? (
              <Text
                style={{ marginTop: 12, color: CFA.danger, fontWeight: "800" }}
              >
                {err}
              </Text>
            ) : null}

            <Pressable
              onPress={onLogin}
              disabled={loading}
              style={{
                marginTop: 16,
                backgroundColor: CFA.red,
                paddingVertical: 12,
                borderRadius: 16,
                alignItems: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900" }}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>

            <Text style={{ marginTop: 12, color: CFA.muted, fontSize: 12 }}>
              Tip: use an email containing “admin” to see the Users tab.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
