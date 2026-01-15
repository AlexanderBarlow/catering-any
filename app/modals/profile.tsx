import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CFA } from "../../constants/theme";
import { useSession } from "../../hooks/useSession";
import { http } from "../../src/api/client";

function Card({
  children,
  style,
  title,
  subtitle,
  icon,
}: {
  children: React.ReactNode;
  style?: any;
  title?: string;
  subtitle?: string;
  icon?: any;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: CFA.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: CFA.border,
          padding: 14,
        },
        style,
      ]}
    >
      {(title || subtitle) && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {icon ? (
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: CFA.border,
                backgroundColor: "rgba(11,18,32,0.03)",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              <Ionicons name={icon} size={16} color={CFA.muted} />
            </View>
          ) : null}

          <View style={{ flex: 1 }}>
            {title ? (
              <Text style={{ color: CFA.ink, fontWeight: "900", fontSize: 15 }}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text style={{ color: CFA.muted, marginTop: 2, fontSize: 12 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {children}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
      {children}
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = "none",
  right,
  helper,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  right?: React.ReactNode;
  helper?: string;
  error?: string;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Label>{label}</Label>
        {right ? right : null}
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(11,18,32,0.40)"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        selectionColor={CFA.red}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: error ? "rgba(229,22,54,0.35)" : CFA.border,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: "rgba(11,18,32,0.02)",
          color: CFA.ink,
          fontWeight: "800",
        }}
      />

      {error ? (
        <Text
          style={{
            marginTop: 6,
            color: CFA.red,
            fontSize: 12,
            fontWeight: "800",
          }}
        >
          {error}
        </Text>
      ) : helper ? (
        <Text style={{ marginTop: 6, color: CFA.muted, fontSize: 12 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function prettyRole(role?: string) {
  const r = String(role || "").toUpperCase();
  return r === "ADMIN" ? "Admin" : r === "MANAGER" ? "Manager" : "Staff";
}

function initials(nameOrEmail?: string) {
  const t = String(nameOrEmail || "?").trim();
  const parts = t.includes("@") ? [t.split("@")[0]] : t.split(" ");
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function Banner({
  tone,
  text,
  onDismiss,
}: {
  tone: "success" | "warn" | "danger";
  text: string;
  onDismiss?: () => void;
}) {
  const cfg =
    tone === "success"
      ? {
          bg: "rgba(46,204,113,0.10)",
          bd: "rgba(46,204,113,0.25)",
          fg: CFA.success,
          icon: "checkmark-circle",
        }
      : tone === "warn"
      ? {
          bg: "rgba(241,196,15,0.10)",
          bd: "rgba(241,196,15,0.25)",
          fg: CFA.warn,
          icon: "alert-circle",
        }
      : {
          bg: "rgba(229,22,54,0.08)",
          bd: "rgba(229,22,54,0.22)",
          fg: CFA.red,
          icon: "close-circle",
        };

  return (
    <View
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: cfg.bd,
        backgroundColor: cfg.bg,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Ionicons name={cfg.icon as any} size={18} color={cfg.fg} />
      <Text style={{ flex: 1, color: CFA.ink, fontWeight: "800" }}>{text}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss} hitSlop={10}>
          <Ionicons name="close" size={16} color={CFA.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ProfileModal() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isWide = isLandscape && width >= 920; // iPad / big phones in landscape

  const { user, token, signOut, setUser } = useSession();

  // Local editable profile state
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Inline feedback banners
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  // Load "me" from server to ensure we show true role/email/name
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const me = await http.get("/auth/me");
        const u = me?.user ?? me;

        if (!mounted || !u) return;

        setName(u.name ?? "");
        setEmail(u.email ?? "");

        await setUser({
          id: u.id,
          name: u.name ?? "",
          email: u.email,
          role: u.role,
        });
      } catch {
        // fallback to stored session user
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setUser]);

  // Validation
  const emailClean = useMemo(() => email.trim().toLowerCase(), [email]);
  const nameClean = useMemo(() => name.trim(), [name]);

  const emailError = useMemo(() => {
    if (!emailClean) return "Email is required.";
    if (!validateEmail(emailClean)) return "Enter a valid email address.";
    return "";
  }, [emailClean]);

  const nameError = useMemo(() => {
    if (!nameClean) return "Name is required.";
    return "";
  }, [nameClean]);

  const profileDirty = useMemo(() => {
    return (
      nameClean !== (user?.name ?? "") || emailClean !== (user?.email ?? "")
    );
  }, [nameClean, emailClean, user?.name, user?.email]);

  const canSaveProfile = useMemo(() => {
    return !savingProfile && profileDirty && !nameError && !emailError;
  }, [savingProfile, profileDirty, nameError, emailError]);

  const pwMismatch = useMemo(() => {
    if (!newPw2) return false;
    return newPw !== newPw2;
  }, [newPw, newPw2]);

  const pwError = useMemo(() => {
    if (!newPw && !newPw2 && !currentPw) return "";
    if (newPw && newPw.length < 6)
      return "New password must be at least 6 characters.";
    if (pwMismatch) return "New passwords do not match.";
    return "";
  }, [newPw, newPw2, currentPw, pwMismatch]);

  const canSavePassword = useMemo(() => {
    if (savingPw) return false;
    if (!currentPw || !newPw || !newPw2) return false;
    if (newPw.length < 6) return false;
    if (pwMismatch) return false;
    return true;
  }, [currentPw, newPw, newPw2, savingPw, pwMismatch]);

  async function handleSaveProfile() {
    setProfileMsg(null);

    if (nameError) return Alert.alert("Fix name", nameError);
    if (emailError) return Alert.alert("Fix email", emailError);

    try {
      setSavingProfile(true);

      const res = await http.put("/auth/me", {
        name: nameClean,
        email: emailClean,
      });
      const updated = res?.user ?? res;

      setName(updated?.name ?? nameClean);
      setEmail(updated?.email ?? emailClean);

      await setUser({
        id: user!.id,
        name: updated?.name ?? nameClean,
        email: updated?.email ?? emailClean,
        role: user!.role,
      });

      setProfileMsg("Saved. Your profile info is now up to date.");
    } catch (e: any) {
      setProfileMsg(
        e?.message ? `Save failed: ${String(e.message)}` : "Save failed."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPwMsg(null);

    if (pwError) return Alert.alert("Fix password", pwError);

    try {
      setSavingPw(true);

      await http.put("/auth/password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });

      setCurrentPw("");
      setNewPw("");
      setNewPw2("");
      setShowPw(false);

      setPwMsg("Password updated successfully.");
    } catch (e: any) {
      setPwMsg(
        e?.message ? `Update failed: ${String(e.message)}` : "Update failed."
      );
    } finally {
      setSavingPw(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.replace("/(auth)/login");
    }
  };

  // Safe paddings:
  // - side padding respects notches in landscape
  // - bottom padding keeps content above home indicator + feels good with your centered floating tab bar
  const sidePad = 16 + Math.max(insets.left, insets.right);
  const bottomPad = 18 + insets.bottom;

  const IdentityCard = (
    <Card
      title="Account"
      subtitle="Your identity and access level"
      icon="person-circle"
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            backgroundColor: "rgba(11,18,32,0.06)",
            borderWidth: 1,
            borderColor: CFA.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: CFA.ink, fontWeight: "900", fontSize: 18 }}>
            {initials(user?.name || user?.email)}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: CFA.ink, fontWeight: "900", fontSize: 16 }}>
            {user?.name || "(No name)"}
          </Text>
          <Text style={{ color: CFA.muted, marginTop: 2 }}>
            {user?.email || "—"}
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: CFA.border,
                backgroundColor: "rgba(11,18,32,0.02)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="shield-checkmark" size={14} color={CFA.muted} />
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                {prettyRole(user?.role)}
              </Text>
            </View>

            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: CFA.border,
                backgroundColor: "rgba(11,18,32,0.02)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="key" size={14} color={CFA.muted} />
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                Token {token ? "Loaded" : "Missing"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          <ActivityIndicator />
          <Text style={{ color: CFA.muted, fontWeight: "800" }}>
            Syncing with server…
          </Text>
        </View>
      ) : null}
    </Card>
  );

  const EditProfileCard = (
    <Card
      title="Edit profile"
      subtitle="Update your name or email address"
      icon="create"
    >
      <Field
        label="Name"
        value={name}
        onChangeText={(t) => {
          setProfileMsg(null);
          setName(t);
        }}
        placeholder="Your name"
        autoCapitalize="words"
        error={profileDirty ? nameError : ""}
      />

      <Field
        label="Email"
        value={email}
        onChangeText={(t) => {
          setProfileMsg(null);
          setEmail(t);
        }}
        placeholder="you@company.com"
        keyboardType="email-address"
        error={profileDirty ? emailError : ""}
        helper="Tip: use the email you’ll log in with."
      />

      <Pressable
        onPress={handleSaveProfile}
        disabled={!canSaveProfile}
        style={{
          marginTop: 14,
          paddingVertical: 12,
          borderRadius: 18,
          backgroundColor: CFA.red,
          alignItems: "center",
          opacity: canSaveProfile ? 1 : 0.55,
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {savingProfile ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="save-outline" size={18} color="#fff" />
        )}
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          {savingProfile
            ? "Saving..."
            : profileDirty
            ? "Save changes"
            : "Saved"}
        </Text>
      </Pressable>

      {profileMsg ? (
        <Banner
          tone={
            profileMsg.startsWith("Saved")
              ? "success"
              : profileMsg.startsWith("Save failed")
              ? "danger"
              : "warn"
          }
          text={profileMsg}
          onDismiss={() => setProfileMsg(null)}
        />
      ) : null}
    </Card>
  );

  const PasswordCard = (
    <Card
      title="Change password"
      subtitle="Requires current password for security"
      icon="lock-closed"
    >
      <Field
        label="Current password"
        value={currentPw}
        onChangeText={(t) => {
          setPwMsg(null);
          setCurrentPw(t);
        }}
        placeholder="••••••••"
        secureTextEntry={!showPw}
        right={
          <Pressable
            onPress={() => setShowPw((v) => !v)}
            hitSlop={10}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: CFA.border,
              backgroundColor: "rgba(11,18,32,0.02)",
            }}
          >
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              {showPw ? "Hide" : "Show"}
            </Text>
          </Pressable>
        }
      />

      <Field
        label="New password"
        value={newPw}
        onChangeText={(t) => {
          setPwMsg(null);
          setNewPw(t);
        }}
        placeholder="At least 6 characters"
        secureTextEntry={!showPw}
        helper="Recommended: 10+ characters with a mix of letters & symbols."
        error={pwError && newPw ? pwError : ""}
      />

      <Field
        label="Confirm new password"
        value={newPw2}
        onChangeText={(t) => {
          setPwMsg(null);
          setNewPw2(t);
        }}
        placeholder="Repeat new password"
        secureTextEntry={!showPw}
        error={pwMismatch ? "New passwords do not match." : ""}
      />

      <Pressable
        onPress={handleChangePassword}
        disabled={!canSavePassword}
        style={{
          marginTop: 14,
          paddingVertical: 12,
          borderRadius: 18,
          backgroundColor: CFA.red,
          alignItems: "center",
          opacity: canSavePassword ? 1 : 0.55,
          flexDirection: "row",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {savingPw ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="key-outline" size={18} color="#fff" />
        )}
        <Text style={{ color: "#fff", fontWeight: "900" }}>
          {savingPw ? "Updating..." : "Update password"}
        </Text>
      </Pressable>

      {pwMsg ? (
        <Banner
          tone={
            pwMsg.startsWith("Password updated")
              ? "success"
              : pwMsg.startsWith("Update failed")
              ? "danger"
              : "warn"
          }
          text={pwMsg}
          onDismiss={() => setPwMsg(null)}
        />
      ) : null}
    </Card>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: CFA.cream }}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ paddingHorizontal: sidePad, paddingTop: 10, flex: 1 }}>
          {/* Top bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: CFA.border,
                backgroundColor: CFA.card,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={18} color={CFA.muted} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={{ color: CFA.ink, fontSize: 20, fontWeight: "900" }}>
                Profile
              </Text>
              <Text style={{ color: CFA.muted, marginTop: 2 }}>
                Account settings
              </Text>
            </View>

            <Pressable
              onPress={handleSignOut}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(229,22,54,0.22)",
                backgroundColor: "rgba(229,22,54,0.06)",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="log-out-outline" size={16} color={CFA.red} />
              <Text style={{ color: CFA.red, fontWeight: "900", fontSize: 12 }}>
                Sign out
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: bottomPad,
            }}
            showsVerticalScrollIndicator={false}
          >
            {!isWide ? (
              <>
                {IdentityCard}
                <View style={{ height: 14 }} />
                {EditProfileCard}
                <View style={{ height: 14 }} />
                {PasswordCard}
              </>
            ) : (
              <View style={{ flexDirection: "row", gap: 14 }}>
                <View style={{ flex: 1 }}>
                  {IdentityCard}
                  <View style={{ height: 14 }} />
                  {EditProfileCard}
                </View>
                <View style={{ flex: 1 }}>{PasswordCard}</View>
              </View>
            )}

            {/* Bottom helper */}
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: CFA.muted, fontSize: 12 }}>
                Tip: If you change your email, you’ll use that new email next
                time you sign in.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
