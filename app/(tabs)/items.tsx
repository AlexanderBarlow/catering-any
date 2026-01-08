import React, { useMemo, useState } from "react";
import {
  Alert,
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

type Category = "Entree" | "Side" | "Drink" | "Dessert" | "Sauce" | "Other";

type ItemRow = {
  id: string;
  name: string;
  category: Category;
  active: boolean;

  price: number; // selling price
  cost: number; // cost per item

  qtySoldPeriod: number; // mock “period” sales volume
  updatedAt: string; // ISO
};

const CATS: Array<Category | "All"> = [
  "All",
  "Entree",
  "Side",
  "Drink",
  "Dessert",
  "Sauce",
  "Other",
];

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

function money(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `$${x.toFixed(2)}`;
}

function clampPct(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(-999, Math.min(999, n));
}

function marginPct(price: number, cost: number) {
  if (!price) return 0;
  return clampPct(((price - cost) / price) * 100);
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

function genId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function ItemsPage() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isWide = isLandscape && width >= 900;

  const bottomPadForNav = insets.bottom + (isWide ? 110 : 98);
  const sidePad = 16 + Math.max(insets.left, insets.right);

  const [items, setItems] = useState<ItemRow[]>(() => {
    const now = new Date().toISOString();
    return [
      {
        id: "i-1",
        name: "Chicken Sandwich",
        category: "Entree",
        active: true,
        price: 5.49,
        cost: 1.92,
        qtySoldPeriod: 380,
        updatedAt: now,
      },
      {
        id: "i-2",
        name: "Spicy Chicken Sandwich",
        category: "Entree",
        active: true,
        price: 5.79,
        cost: 2.05,
        qtySoldPeriod: 260,
        updatedAt: now,
      },
      {
        id: "i-3",
        name: "Waffle Fries (Med)",
        category: "Side",
        active: true,
        price: 2.49,
        cost: 0.68,
        qtySoldPeriod: 520,
        updatedAt: now,
      },
      {
        id: "i-4",
        name: "Lemonade (Med)",
        category: "Drink",
        active: true,
        price: 2.79,
        cost: 0.52,
        qtySoldPeriod: 410,
        updatedAt: now,
      },
      {
        id: "i-5",
        name: "Chick-fil-A Sauce",
        category: "Sauce",
        active: true,
        price: 0.25,
        cost: 0.06,
        qtySoldPeriod: 1200,
        updatedAt: now,
      },
      {
        id: "i-6",
        name: "Cookie",
        category: "Dessert",
        active: false,
        price: 1.89,
        cost: 0.44,
        qtySoldPeriod: 85,
        updatedAt: now,
      },
    ];
  });

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [onlyActive, setOnlyActive] = useState(true);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form fields
  const [fName, setFName] = useState("");
  const [fCat, setFCat] = useState<Category>("Entree");
  const [fPrice, setFPrice] = useState("0");
  const [fCost, setFCost] = useState("0");
  const [fQty, setFQty] = useState("0");
  const [fActive, setFActive] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => (onlyActive ? i.active : true))
      .filter((i) => (cat === "All" ? true : i.category === cat))
      .filter((i) => {
        if (!q) return true;
        return i.name.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        // highest revenue first
        const ra = a.price * a.qtySoldPeriod;
        const rb = b.price * b.qtySoldPeriod;
        return rb - ra;
      });
  }, [items, query, cat, onlyActive]);

  const summary = useMemo(() => {
    const list = filtered;
    const revenue = list.reduce((sum, i) => sum + i.price * i.qtySoldPeriod, 0);
    const cost = list.reduce((sum, i) => sum + i.cost * i.qtySoldPeriod, 0);
    const profit = revenue - cost;
    const avgMargin = revenue ? (profit / revenue) * 100 : 0;
    return { revenue, cost, profit, avgMargin };
  }, [filtered]);

  function resetForm() {
    setEditingId(null);
    setFName("");
    setFCat("Entree");
    setFPrice("0");
    setFCost("0");
    setFQty("0");
    setFActive(true);
  }

  function openAdd() {
    resetForm();
    setModalOpen(true);
  }

  function openEdit(item: ItemRow) {
    setEditingId(item.id);
    setFName(item.name);
    setFCat(item.category);
    setFPrice(String(item.price));
    setFCost(String(item.cost));
    setFQty(String(item.qtySoldPeriod));
    setFActive(item.active);
    setModalOpen(true);
  }

  function toNum(s: string) {
    const n = Number(String(s).replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function saveItem() {
    const name = fName.trim();
    const price = toNum(fPrice);
    const cost = toNum(fCost);
    const qty = Math.max(0, Math.floor(toNum(fQty)));

    if (!name) {
      Alert.alert("Missing name", "Please enter an item name.");
      return;
    }
    if (price <= 0) {
      Alert.alert("Invalid price", "Price must be greater than $0.00");
      return;
    }
    if (cost < 0) {
      Alert.alert("Invalid cost", "Cost cannot be negative.");
      return;
    }

    // prevent dupes by name
    const dupe = items.find(
      (i) => i.name.toLowerCase() === name.toLowerCase() && i.id !== editingId
    );
    if (dupe) {
      Alert.alert("Duplicate item", "An item with that name already exists.");
      return;
    }

    const payload: ItemRow = {
      id: editingId ?? genId(),
      name,
      category: fCat,
      active: fActive,
      price,
      cost,
      qtySoldPeriod: qty,
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => {
      if (editingId) return prev.map((x) => (x.id === editingId ? payload : x));
      return [payload, ...prev];
    });

    setModalOpen(false);
  }

  function removeItem(item: ItemRow) {
    Alert.alert("Remove item?", `Remove "${item.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setItems((prev) => prev.filter((x) => x.id !== item.id)),
      },
    ]);
  }

  return (
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
              Items
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 4 }}>
              Price + cost per item for margin + sales stats
            </Text>
          </View>

          <Pressable
            onPress={openAdd}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: CFA.red,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>
              Add Item
            </Text>
          </Pressable>
        </View>

        {/* Summary */}
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: CFA.ink, fontWeight: "900" }}>
            Period Summary
          </Text>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                Revenue
              </Text>
              <Text
                style={{
                  color: CFA.ink,
                  fontWeight: "900",
                  fontSize: 20,
                  marginTop: 6,
                }}
              >
                ${summary.revenue.toFixed(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                Cost
              </Text>
              <Text
                style={{
                  color: CFA.ink,
                  fontWeight: "900",
                  fontSize: 20,
                  marginTop: 6,
                }}
              >
                ${summary.cost.toFixed(0)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                Profit
              </Text>
              <Text
                style={{
                  color: summary.profit >= 0 ? CFA.success : CFA.danger,
                  fontWeight: "900",
                  fontSize: 20,
                  marginTop: 6,
                }}
              >
                ${summary.profit.toFixed(0)}
              </Text>
              <Text
                style={{
                  color: CFA.muted,
                  marginTop: 4,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                {summary.avgMargin.toFixed(1)}% margin
              </Text>
            </View>
          </View>
        </Card>

        {/* Search + filters */}
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
              placeholder="Search items…"
              placeholderTextColor="rgba(11,18,32,0.40)"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                color: CFA.ink,
                fontWeight: "800",
              }}
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
            {CATS.map((c) => (
              <Chip
                key={c}
                text={c}
                active={cat === c}
                onPress={() => setCat(c as any)}
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
          <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}>
            Items ({filtered.length})
          </Text>

          {filtered.length === 0 ? (
            <View style={{ paddingVertical: 22, alignItems: "center" }}>
              <Ionicons name="fast-food-outline" size={26} color={CFA.muted} />
              <Text
                style={{ color: CFA.muted, marginTop: 8, fontWeight: "800" }}
              >
                No items match your filters.
              </Text>
            </View>
          ) : (
            filtered.map((it, idx) => {
              const rev = it.price * it.qtySoldPeriod;
              const profit = (it.price - it.cost) * it.qtySoldPeriod;
              const mp = marginPct(it.price, it.cost);
              const mpColor =
                mp >= 45 ? CFA.success : mp >= 25 ? CFA.warn : CFA.danger;

              return (
                <Pressable
                  key={it.id}
                  onPress={() => openEdit(it)}
                  style={{
                    paddingVertical: 12,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: CFA.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: CFA.ink, fontWeight: "900" }}>
                        {it.name}
                      </Text>
                      <Text
                        style={{ color: CFA.muted, marginTop: 3, fontSize: 12 }}
                      >
                        {it.category} • {it.active ? "Active" : "Inactive"} •
                        Qty: {it.qtySoldPeriod}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: CFA.ink, fontWeight: "900" }}>
                        ${rev.toFixed(0)}
                      </Text>
                      <Text
                        style={{
                          color: mpColor,
                          fontWeight: "900",
                          marginTop: 2,
                          fontSize: 12,
                        }}
                      >
                        {mp.toFixed(1)}% margin
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: CFA.border,
                        backgroundColor: "rgba(11,18,32,0.02)",
                      }}
                    >
                      <Text
                        style={{
                          color: CFA.muted,
                          fontWeight: "900",
                          fontSize: 11,
                        }}
                      >
                        Price / Cost
                      </Text>
                      <Text
                        style={{
                          color: CFA.ink,
                          fontWeight: "900",
                          marginTop: 4,
                        }}
                      >
                        {money(it.price)} / {money(it.cost)}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: CFA.border,
                        backgroundColor: "rgba(11,18,32,0.02)",
                      }}
                    >
                      <Text
                        style={{
                          color: CFA.muted,
                          fontWeight: "900",
                          fontSize: 11,
                        }}
                      >
                        Profit Est.
                      </Text>
                      <Text
                        style={{
                          color: profit >= 0 ? CFA.success : CFA.danger,
                          fontWeight: "900",
                          marginTop: 4,
                        }}
                      >
                        ${profit.toFixed(0)}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => removeItem(it)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(229,22,54,0.22)",
                        backgroundColor: "rgba(229,22,54,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="trash" size={18} color={CFA.red} />
                    </Pressable>
                  </View>
                </Pressable>
              );
            })
          )}
        </Card>

        <Text style={{ color: CFA.muted, marginTop: 12, fontSize: 12 }}>
          UI-only: items are stored in local state for now. We’ll connect to
          catering-api later.
        </Text>
      </ScrollView>

      {/* Add/Edit Modal */}
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
              <Text style={{ color: CFA.ink, fontWeight: "900", fontSize: 18 }}>
                {editingId ? "Edit Item" : "Add Item"}
              </Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={CFA.muted} />
              </Pressable>
            </View>

            <Text style={{ color: CFA.muted }}>
              Set price + cost per item to compute margins.
            </Text>

            <Field
              label="Name"
              value={fName}
              onChangeText={setFName}
              placeholder="e.g., Grilled Nuggets Tray"
              autoCapitalize="words"
            />

            <Text
              style={{
                color: CFA.muted,
                fontWeight: "900",
                fontSize: 12,
                marginTop: 14,
              }}
            >
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              <View style={{ flexDirection: "row", gap: 10, paddingRight: 14 }}>
                {(
                  [
                    "Entree",
                    "Side",
                    "Drink",
                    "Dessert",
                    "Sauce",
                    "Other",
                  ] as Category[]
                ).map((c) => {
                  const active = fCat === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setFCat(c)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: active ? CFA.red : CFA.border,
                        backgroundColor: active
                          ? "rgba(229,22,54,0.10)"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? CFA.red : CFA.muted,
                          fontWeight: "900",
                        }}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Price"
                  value={fPrice}
                  onChangeText={setFPrice}
                  placeholder="5.99"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="Cost"
                  value={fCost}
                  onChangeText={setFCost}
                  placeholder="1.85"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Qty Sold (Period)"
                  value={fQty}
                  onChangeText={setFQty}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Pressable
                  onPress={() => setFActive((v) => !v)}
                  style={{
                    marginTop: 12,
                    paddingVertical: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: fActive ? "rgba(77,123,74,0.30)" : CFA.border,
                    backgroundColor: fActive
                      ? "rgba(77,123,74,0.12)"
                      : "transparent",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons
                    name={fActive ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={fActive ? CFA.success : CFA.muted}
                  />
                  <Text
                    style={{
                      color: fActive ? CFA.success : CFA.muted,
                      fontWeight: "900",
                    }}
                  >
                    {fActive ? "Active" : "Inactive"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* quick computed preview */}
            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: CFA.border,
                    backgroundColor: "rgba(11,18,32,0.02)",
                  }}
                >
                  <Text
                    style={{
                      color: CFA.muted,
                      fontWeight: "900",
                      fontSize: 11,
                    }}
                  >
                    Margin %
                  </Text>
                  <Text
                    style={{ color: CFA.ink, fontWeight: "900", marginTop: 4 }}
                  >
                    {marginPct(toNum(fPrice), toNum(fCost)).toFixed(1)}%
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: CFA.border,
                    backgroundColor: "rgba(11,18,32,0.02)",
                  }}
                >
                  <Text
                    style={{
                      color: CFA.muted,
                      fontWeight: "900",
                      fontSize: 11,
                    }}
                  >
                    Est. Profit
                  </Text>
                  <Text
                    style={{ color: CFA.ink, fontWeight: "900", marginTop: 4 }}
                  >
                    $
                    {(
                      (toNum(fPrice) - toNum(fCost)) *
                      Math.max(0, Math.floor(toNum(fQty)))
                    ).toFixed(0)}
                  </Text>
                </View>
              </View>
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
                onPress={saveItem}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 18,
                  backgroundColor: CFA.red,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>
                  {editingId ? "Save" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
