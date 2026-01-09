import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CFA } from "../../constants/theme";
import TabScreenTransition from "../../components/TabScreenTransition";

import { api } from "../../src/api/client";

type Role = "ADMIN" | "MANAGER" | "STAFF";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string; // ISO
  active: boolean;
};

const ROLE_FILTERS: Array<{ key: "ALL" | Role; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "ADMIN", label: "Admins" },
  { key: "MANAGER", label: "Managers" },
  { key: "STAFF", label: "Staff" },
];

function pillColor(role: Role) {
  switch (role) {
    case "ADMIN":
      return "rgba(229,22,54,0.12)";
    case "MANAGER":
      return "rgba(77,123,74,0.14)";
    case "STAFF":
      return "rgba(138,162,255,0.14)";
    default:
      return "rgba(11,18,32,0.08)";
  }
}
function pillTextColor(role: Role) {
  switch (role) {
    case "ADMIN":
      return CFA.red;
    case "MANAGER":
      return CFA.success;
    case "STAFF":
      return "rgba(20,40,120,0.75)";
    default:
      return CFA.muted;
  }
}
function prettyRole(role: Role) {
  return role === "ADMIN" ? "Admin" : role === "MANAGER" ? "Manager" : "Staff";
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: CFA.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: CFA.border,
          padding: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Chip({
  text,
  active,
  onPress,
}: {
  text: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? CFA.red : CFA.border,
        backgroundColor: active ? "rgba(229,22,54,0.10)" : "transparent",
      }}
    >
      <Text
        style={{
          color: active ? CFA.red : CFA.muted,
          fontWeight: "900",
          fontSize: 12,
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(11,18,32,0.40)"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: CFA.border,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 12,
          backgroundColor: "rgba(11,18,32,0.02)",
          color: CFA.ink,
          fontWeight: "800",
        }}
      />
    </View>
  );
}

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function UsersPage() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isWide = isLandscape && width >= 900;

  const bottomPadForNav = insets.bottom + (isWide ? 110 : 98);
  const sidePad = 16 + Math.max(insets.left, insets.right);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | Role>("ALL");
  const [onlyActive, setOnlyActive] = useState(true);

  // add user modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("STAFF");

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const list = Array.isArray(res) ? res : res?.data;
      setUsers(list || []);
    } catch (e: any) {
      Alert.alert("Load failed", e?.message ?? "Could not load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function resetAddForm() {
    setNewName("");
    setNewEmail("");
    setNewRole("STAFF");
  }

  function openAdd() {
    resetAddForm();
    setModalOpen(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => (onlyActive ? u.active : true))
      .filter((u) => (roleFilter === "ALL" ? true : u.role === roleFilter))
      .filter((u) => {
        if (!q) return true;
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .sort((a, b) => {
        const score = (r: Role) =>
          r === "ADMIN" ? 0 : r === "MANAGER" ? 1 : 2;
        const ds = score(a.role) - score(b.role);
        if (ds !== 0) return ds;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
  }, [users, query, roleFilter, onlyActive]);

  const totals = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.active).length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const managers = users.filter((u) => u.role === "MANAGER").length;
    const staff = users.filter((u) => u.role === "STAFF").length;
    return { total, active, admins, managers, staff };
  }, [users]);

  async function addUser() {
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();

    if (!name) return Alert.alert("Missing name", "Please enter a name.");
    if (!email || !validateEmail(email))
      return Alert.alert("Invalid email", "Please enter a valid email.");

    try {
      setBusyId("create");
      const res = await api.post("/users", { name, email, role: newRole });
      const created = res?.data ?? res;
      const tempPassword = res?.tempPassword;

      setUsers((prev) => [created, ...prev]);
      setModalOpen(false);

      if (tempPassword) {
        Alert.alert(
          "User created",
          `Temporary password:\n\n${tempPassword}\n\nCopy it and send it to the user.`
        );
      } else {
        Alert.alert("User created", "The user was created successfully.");
      }
    } catch (e: any) {
      Alert.alert("Create failed", e?.message ?? "Could not create user.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(u: UserRow) {
    if (u.role === "ADMIN") return;
    try {
      setBusyId(u.id);
      const nextActive = !u.active;

      // optimistic UI
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, active: nextActive } : x))
      );

      const res = await api.put(`/users/${u.id}`, { active: nextActive });
      const updated = res?.data ?? res;

      // re-sync exact response
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (e: any) {
      // rollback by reloading
      await loadUsers();
      Alert.alert("Update failed", e?.message ?? "Could not update user.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser(u: UserRow) {
    if (u.role === "ADMIN") {
      Alert.alert("Protected user", "Admins cannot be removed.");
      return;
    }

    Alert.alert(
      "Remove user?",
      `Remove ${u.name ?? "User"} (${u.email}) from the app?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(u.id);

              // optimistic UI
              setUsers((prev) => prev.filter((x) => x.id !== u.id));

              await api.del(`/users/${u.id}`);
            } catch (e: any) {
              await loadUsers();
              Alert.alert(
                "Delete failed",
                e?.message ?? "Could not delete user."
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  }

  return (
    <TabScreenTransition>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: CFA.cream }}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: bottomPadForNav,
            paddingLeft: sidePad,
            paddingRight: sidePad,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: CFA.ink }}>
                Users
              </Text>
              <Text style={{ color: CFA.muted, marginTop: 4 }}>
                Manage access to analytics and operations
              </Text>
            </View>

            <Pressable
              onPress={openAdd}
              disabled={busyId !== null}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 16,
                backgroundColor: CFA.red,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                opacity: busyId ? 0.7 : 1,
              }}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>
                Add User
              </Text>
            </Pressable>
          </View>

          {/* Summary */}
          <Card style={{ marginTop: 14 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
                >
                  Total Users
                </Text>
                <Text
                  style={{
                    color: CFA.ink,
                    fontWeight: "900",
                    fontSize: 22,
                    marginTop: 6,
                  }}
                >
                  {totals.total}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
                >
                  Active
                </Text>
                <Text
                  style={{
                    color: CFA.ink,
                    fontWeight: "900",
                    fontSize: 22,
                    marginTop: 6,
                  }}
                >
                  {totals.active}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
                >
                  Roles
                </Text>
                <Text
                  style={{ color: CFA.muted, marginTop: 6, fontWeight: "800" }}
                >
                  {totals.admins} A • {totals.managers} M • {totals.staff} S
                </Text>
              </View>
            </View>
          </Card>

          {/* Search */}
          <Card style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderWidth: 1,
                borderColor: CFA.border,
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
                backgroundColor: "rgba(11,18,32,0.02)",
              }}
            >
              <Ionicons name="search" size={18} color={CFA.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or email…"
                placeholderTextColor="rgba(11,18,32,0.40)"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, color: CFA.ink, fontWeight: "800" }}
              />
              {query ? (
                <Pressable onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color={CFA.muted} />
                </Pressable>
              ) : null}
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {ROLE_FILTERS.map((r) => (
                <Chip
                  key={r.key}
                  text={r.label}
                  active={roleFilter === r.key}
                  onPress={() => setRoleFilter(r.key)}
                />
              ))}

              <Pressable
                onPress={() => setOnlyActive((v) => !v)}
                style={{
                  marginLeft: "auto",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: onlyActive ? "rgba(77,123,74,0.30)" : CFA.border,
                  backgroundColor: onlyActive
                    ? "rgba(77,123,74,0.12)"
                    : "transparent",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons
                  name={onlyActive ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={onlyActive ? CFA.success : CFA.muted}
                />
                <Text
                  style={{
                    color: onlyActive ? CFA.success : CFA.muted,
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  Active only
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* List */}
          <Card style={{ marginTop: 14 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}
              >
                Directory
              </Text>

              <Pressable onPress={loadUsers} hitSlop={10}>
                <Ionicons name="refresh" size={18} color={CFA.muted} />
              </Pressable>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 18, alignItems: "center" }}>
                <ActivityIndicator />
                <Text
                  style={{ marginTop: 10, color: CFA.muted, fontWeight: "800" }}
                >
                  Loading users…
                </Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={{ paddingVertical: 22, alignItems: "center" }}>
                <Ionicons name="people-outline" size={26} color={CFA.muted} />
                <Text
                  style={{ color: CFA.muted, marginTop: 8, fontWeight: "800" }}
                >
                  No users match your filters.
                </Text>
              </View>
            ) : (
              filtered.map((u, idx) => (
                <View
                  key={u.id}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: CFA.border,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                          backgroundColor: "rgba(11,18,32,0.06)",
                          borderWidth: 1,
                          borderColor: CFA.border,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: CFA.ink, fontWeight: "900" }}>
                          {(u.name || u.email || "?")
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase())
                            .join("")}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: CFA.ink, fontWeight: "900" }}>
                          {u.name || "(No name)"}
                        </Text>
                        <Text
                          style={{
                            color: CFA.muted,
                            marginTop: 2,
                            fontSize: 12,
                          }}
                        >
                          {u.email}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          backgroundColor: pillColor(u.role),
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.06)",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "900",
                            fontSize: 12,
                            color: pillTextColor(u.role),
                          }}
                        >
                          {prettyRole(u.role)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{ flexDirection: "row", gap: 12, marginTop: 10 }}
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
                        <Ionicons
                          name={u.active ? "flash" : "pause"}
                          size={14}
                          color={u.active ? CFA.success : CFA.muted}
                        />
                        <Text
                          style={{
                            color: CFA.muted,
                            fontWeight: "900",
                            fontSize: 12,
                          }}
                        >
                          {u.active ? "Active" : "Inactive"}
                        </Text>
                      </View>

                      <Text
                        style={{ color: CFA.muted, fontSize: 12, marginTop: 6 }}
                      >
                        Added {new Date(u.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {/* actions */}
                  <View style={{ gap: 10, alignItems: "flex-end" }}>
                    <Pressable
                      onPress={() => toggleActive(u)}
                      disabled={u.role === "ADMIN" || busyId === u.id}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: CFA.border,
                        backgroundColor: CFA.card,
                        opacity:
                          u.role === "ADMIN" || busyId === u.id ? 0.55 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name={u.active ? "pause" : "play"}
                        size={16}
                        color={CFA.muted}
                      />
                      <Text
                        style={{
                          color: CFA.muted,
                          fontWeight: "900",
                          fontSize: 12,
                        }}
                      >
                        {u.active ? "Disable" : "Enable"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => removeUser(u)}
                      disabled={u.role === "ADMIN" || busyId === u.id}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(229,22,54,0.22)",
                        backgroundColor: "rgba(229,22,54,0.06)",
                        opacity:
                          u.role === "ADMIN" || busyId === u.id ? 0.55 : 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons name="trash" size={16} color={CFA.red} />
                      <Text
                        style={{
                          color: CFA.red,
                          fontWeight: "900",
                          fontSize: 12,
                        }}
                      >
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </Card>

          <Text style={{ color: CFA.muted, marginTop: 12, fontSize: 12 }}>
            Live: users are loaded from catering-api (/users).
          </Text>
        </ScrollView>

        {/* Add User Modal */}
        <Modal visible={modalOpen} animationType="slide" transparent>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(11,18,32,0.35)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: CFA.card,
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                borderWidth: 1,
                borderColor: CFA.border,
                padding: 16,
                paddingBottom: 16 + insets.bottom,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{ color: CFA.ink, fontWeight: "900", fontSize: 18 }}
                >
                  Add User
                </Text>
                <Pressable onPress={() => setModalOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color={CFA.muted} />
                </Pressable>
              </View>

              <Text style={{ color: CFA.muted }}>
                Create an account for staff access.
              </Text>

              <Field
                label="Name"
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g., Alex Barlow"
                autoCapitalize="words"
              />
              <Field
                label="Email"
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="e.g., user@company.com"
                keyboardType="email-address"
              />

              <Text
                style={{
                  color: CFA.muted,
                  fontWeight: "900",
                  fontSize: 12,
                  marginTop: 14,
                }}
              >
                Role
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                {(["ADMIN", "MANAGER", "STAFF"] as Role[]).map((r) => {
                  const active = newRole === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setNewRole(r)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: active ? CFA.red : CFA.border,
                        backgroundColor: active
                          ? "rgba(229,22,54,0.10)"
                          : "transparent",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? CFA.red : CFA.muted,
                          fontWeight: "900",
                        }}
                      >
                        {prettyRole(r)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                <Pressable
                  onPress={() => setModalOpen(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: CFA.border,
                    backgroundColor: "transparent",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: CFA.muted, fontWeight: "900" }}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={addUser}
                  disabled={busyId === "create"}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 18,
                    backgroundColor: CFA.red,
                    alignItems: "center",
                    opacity: busyId === "create" ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {busyId === "create" ? "Creating..." : "Create"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TabScreenTransition>
  );
}
