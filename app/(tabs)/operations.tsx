import React, { useMemo, useState } from "react";
import {
  Alert,
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

type Range = "1d" | "7d" | "30d" | "ytd";
type TicketStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

type Ticket = {
  id: string;
  customer: string;
  createdAt: string; // ISO
  promisedMins: number; // SLA target
  durationMins: number; // created -> completed
  status: TicketStatus;
  itemsCount: number;
  revenue: number;
};

type Note = {
  id: string;
  createdAt: string;
  text: string;
  tag: "Staffing" | "Quality" | "Ops" | "Supply";
};

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
  active,
  text,
  onPress,
}: {
  active: boolean;
  text: string;
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
  return `$${Number(n || 0).toLocaleString()}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function statusPill(status: TicketStatus) {
  switch (status) {
    case "PENDING":
      return {
        bg: "rgba(138,162,255,0.14)",
        fg: "rgba(20,40,120,0.80)",
        label: "Pending",
      };
    case "IN_PROGRESS":
      return { bg: "rgba(255,193,7,0.16)", fg: CFA.warn, label: "In Progress" };
    case "READY":
      return { bg: "rgba(77,123,74,0.14)", fg: CFA.success, label: "Ready" };
    case "COMPLETED":
      return {
        bg: "rgba(77,123,74,0.16)",
        fg: CFA.success,
        label: "Completed",
      };
    case "CANCELLED":
      return { bg: "rgba(229,22,54,0.12)", fg: CFA.red, label: "Cancelled" };
    default:
      return { bg: "rgba(11,18,32,0.08)", fg: CFA.muted, label: status };
  }
}

function genId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function BarRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: CFA.ink, fontWeight: "800" }}>{label}</Text>
        <Text style={{ color: CFA.muted, fontWeight: "900" }}>
          {value} • {pct}%
        </Text>
      </View>
      <View
        style={{
          marginTop: 8,
          height: 10,
          borderRadius: 999,
          backgroundColor: "rgba(11,18,32,0.06)",
          borderWidth: 1,
          borderColor: CFA.border,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

export default function OperationsPage() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isWide = isLandscape && width >= 900;

  const bottomPadForNav = insets.bottom + (isWide ? 110 : 98);
  const sidePad = 16 + Math.max(insets.left, insets.right);

  const [range, setRange] = useState<Range>("1d");

  // --- UI-only mock data
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const base = new Date();
    const mk = (minsAgo: number, t: Partial<Ticket>): Ticket => {
      const created = new Date(
        base.getTime() - minsAgo * 60 * 1000
      ).toISOString();
      return {
        id: genId(),
        customer: t.customer ?? "Customer",
        createdAt: created,
        promisedMins: t.promisedMins ?? 18,
        durationMins: t.durationMins ?? 16,
        status: t.status ?? "COMPLETED",
        itemsCount: t.itemsCount ?? 10,
        revenue: t.revenue ?? 145,
      };
    };

    return [
      mk(22, {
        customer: "West Office Catering",
        status: "READY",
        durationMins: 14,
        promisedMins: 18,
        itemsCount: 24,
        revenue: 312,
      }),
      mk(48, {
        customer: "Northside PTA",
        status: "COMPLETED",
        durationMins: 19,
        promisedMins: 18,
        itemsCount: 38,
        revenue: 498,
      }),
      mk(65, {
        customer: "Hospital Unit 7",
        status: "IN_PROGRESS",
        durationMins: 0,
        promisedMins: 22,
        itemsCount: 52,
        revenue: 610,
      }),
      mk(92, {
        customer: "Tech Meetup",
        status: "COMPLETED",
        durationMins: 26,
        promisedMins: 20,
        itemsCount: 44,
        revenue: 560,
      }),
      mk(120, {
        customer: "School Admin",
        status: "CANCELLED",
        durationMins: 0,
        promisedMins: 18,
        itemsCount: 18,
        revenue: 0,
      }),
      mk(160, {
        customer: "Downtown Realty",
        status: "COMPLETED",
        durationMins: 15,
        promisedMins: 18,
        itemsCount: 28,
        revenue: 402,
      }),
      mk(210, {
        customer: "Community Center",
        status: "COMPLETED",
        durationMins: 21,
        promisedMins: 20,
        itemsCount: 35,
        revenue: 455,
      }),
    ];
  });

  const [notes, setNotes] = useState<Note[]>(() => [
    {
      id: "n1",
      createdAt: new Date().toISOString(),
      text: "Lemonade prep ran low during 11:30 rush — consider earlier batch.",
      tag: "Ops",
    },
    {
      id: "n2",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      text: "Two large orders spiked ticket time; staging table helped a ton.",
      tag: "Staffing",
    },
  ]);

  const [noteText, setNoteText] = useState("");
  const [noteTag, setNoteTag] = useState<Note["tag"]>("Ops");

  // --- derived stats (UI-only)
  const computed = useMemo(() => {
    const list = tickets;

    const completed = list.filter((t) => t.status === "COMPLETED");
    const cancelled = list.filter((t) => t.status === "CANCELLED");
    const active = list.filter(
      (t) =>
        t.status === "PENDING" ||
        t.status === "IN_PROGRESS" ||
        t.status === "READY"
    );

    const avgMins =
      completed.length > 0
        ? completed.reduce((s, t) => s + (t.durationMins || 0), 0) /
          completed.length
        : 0;

    const onTimeCount = completed.filter(
      (t) => (t.durationMins || 0) <= t.promisedMins
    ).length;
    const onTimePct = completed.length
      ? (onTimeCount / completed.length) * 100
      : 0;

    const cancelledPct = list.length
      ? (cancelled.length / list.length) * 100
      : 0;

    const revenue = list.reduce((s, t) => s + (t.revenue || 0), 0);

    // distribution buckets (completed only)
    const buckets = {
      "0–10m": 0,
      "11–15m": 0,
      "16–20m": 0,
      "21–30m": 0,
      "30m+": 0,
    };
    for (const t of completed) {
      const m = t.durationMins || 0;
      if (m <= 10) buckets["0–10m"]++;
      else if (m <= 15) buckets["11–15m"]++;
      else if (m <= 20) buckets["16–20m"]++;
      else if (m <= 30) buckets["21–30m"]++;
      else buckets["30m+"]++;
    }

    // alerts
    const alerts: Array<{ level: "danger" | "warn" | "ok"; text: string }> = [];
    if (avgMins > 22)
      alerts.push({
        level: "danger",
        text: "Avg ticket time is high — consider staging & batching.",
      });
    else if (avgMins > 18)
      alerts.push({
        level: "warn",
        text: "Ticket time trending up — check staffing during spikes.",
      });
    else alerts.push({ level: "ok", text: "Ticket time looks healthy." });

    if (onTimePct < 75)
      alerts.push({
        level: "danger",
        text: "On-time % is low — review SLA promises vs capacity.",
      });
    else if (onTimePct < 90)
      alerts.push({
        level: "warn",
        text: "On-time % could improve — focus on handoff readiness.",
      });
    else alerts.push({ level: "ok", text: "On-time delivery is strong." });

    if (cancelledPct > 10)
      alerts.push({
        level: "warn",
        text: "Cancellations elevated — check ordering cutoffs & confirmations.",
      });

    return {
      total: list.length,
      completed: completed.length,
      active: active.length,
      cancelled: cancelled.length,
      avgMins,
      onTimePct,
      cancelledPct,
      revenue,
      buckets,
      alerts,
    };
  }, [tickets]);

  const bucketTotal = useMemo(() => {
    return Object.values(computed.buckets).reduce((s, n) => s + n, 0);
  }, [computed.buckets]);

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    const n: Note = {
      id: genId(),
      createdAt: new Date().toISOString(),
      text,
      tag: noteTag,
    };
    setNotes((prev) => [n, ...prev]);
    setNoteText("");
    setNoteTag("Ops");
  }

  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function clearMockTickets() {
    Alert.alert(
      "Reset mock tickets?",
      "This will clear the ticket list (UI-only).",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => setTickets([]) },
      ]
    );
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
              Operations
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 4 }}>
              Ticket flow, readiness, and shift-level insights
            </Text>
          </View>

          <Pressable
            onPress={clearMockTickets}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: CFA.border,
              backgroundColor: CFA.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="refresh" size={16} color={CFA.muted} />
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              Reset
            </Text>
          </Pressable>
        </View>

        {/* Range */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Chip
            text="Today"
            active={range === "1d"}
            onPress={() => setRange("1d")}
          />
          <Chip
            text="7 Days"
            active={range === "7d"}
            onPress={() => setRange("7d")}
          />
          <Chip
            text="30 Days"
            active={range === "30d"}
            onPress={() => setRange("30d")}
          />
          <Chip
            text="YTD"
            active={range === "ytd"}
            onPress={() => setRange("ytd")}
          />

          <View style={{ marginLeft: "auto" }}>
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              UI-only • Range: {range.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* KPI Row */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: CFA.muted, fontSize: 12, fontWeight: "800" }}>
              Orders
            </Text>
            <Text
              style={{
                color: CFA.ink,
                fontSize: 24,
                fontWeight: "900",
                marginTop: 6,
              }}
            >
              {computed.total}
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}>
              Active: {computed.active} • Done: {computed.completed}
            </Text>
          </Card>

          <Card style={{ flex: 1 }}>
            <Text style={{ color: CFA.muted, fontSize: 12, fontWeight: "800" }}>
              Avg Ticket Time
            </Text>
            <Text
              style={{
                color: CFA.ink,
                fontSize: 24,
                fontWeight: "900",
                marginTop: 6,
              }}
            >
              {computed.avgMins.toFixed(1)} min
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}>
              Based on completed tickets
            </Text>
          </Card>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: CFA.muted, fontSize: 12, fontWeight: "800" }}>
              On-time %
            </Text>
            <Text
              style={{
                color: CFA.ink,
                fontSize: 24,
                fontWeight: "900",
                marginTop: 6,
              }}
            >
              {computed.onTimePct.toFixed(0)}%
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}>
              Completed within promised mins
            </Text>
          </Card>

          <Card style={{ flex: 1 }}>
            <Text style={{ color: CFA.muted, fontSize: 12, fontWeight: "800" }}>
              Cancelled %
            </Text>
            <Text
              style={{
                color: CFA.ink,
                fontSize: 24,
                fontWeight: "900",
                marginTop: 6,
              }}
            >
              {computed.cancelledPct.toFixed(0)}%
            </Text>
            <Text style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}>
              Cancelled: {computed.cancelled}
            </Text>
          </Card>
        </View>

        {/* Distribution */}
        <Card style={{ marginTop: 14 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: CFA.ink, fontWeight: "900" }}>
              Ticket Time Distribution
            </Text>
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              Total: {bucketTotal}
            </Text>
          </View>

          <BarRow
            label="0–10m"
            value={computed.buckets["0–10m"]}
            total={bucketTotal}
            color={"rgba(77,123,74,0.60)"}
          />
          <BarRow
            label="11–15m"
            value={computed.buckets["11–15m"]}
            total={bucketTotal}
            color={"rgba(77,123,74,0.40)"}
          />
          <BarRow
            label="16–20m"
            value={computed.buckets["16–20m"]}
            total={bucketTotal}
            color={"rgba(255,193,7,0.45)"}
          />
          <BarRow
            label="21–30m"
            value={computed.buckets["21–30m"]}
            total={bucketTotal}
            color={"rgba(255,193,7,0.35)"}
          />
          <BarRow
            label="30m+"
            value={computed.buckets["30m+"]}
            total={bucketTotal}
            color={"rgba(229,22,54,0.40)"}
          />

          <Text style={{ color: CFA.muted, marginTop: 10, fontSize: 12 }}>
            Tip: we’ll swap this for real ticket histograms once the API is
            wired.
          </Text>
        </Card>

        {/* Recent tickets */}
        <Card style={{ marginTop: 14 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: CFA.ink, fontWeight: "900" }}>
              Recent Tickets
            </Text>
            <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
              Revenue: {money(computed.revenue)}
            </Text>
          </View>

          {tickets.length === 0 ? (
            <View style={{ paddingVertical: 22, alignItems: "center" }}>
              <Ionicons name="timer-outline" size={26} color={CFA.muted} />
              <Text
                style={{ color: CFA.muted, marginTop: 8, fontWeight: "800" }}
              >
                No tickets yet (UI-only).
              </Text>
            </View>
          ) : (
            tickets
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((t, idx) => {
                const pill = statusPill(t.status);
                const isLate =
                  t.status === "COMPLETED" &&
                  (t.durationMins || 0) > t.promisedMins;

                return (
                  <View
                    key={t.id}
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
                          {t.customer}
                        </Text>
                        <Text
                          style={{
                            color: CFA.muted,
                            marginTop: 3,
                            fontSize: 12,
                          }}
                        >
                          {formatTime(t.createdAt)} • {t.itemsCount} items •{" "}
                          {money(t.revenue)}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          backgroundColor: pill.bg,
                          borderWidth: 1,
                          borderColor: "rgba(0,0,0,0.06)",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Ionicons
                          name={
                            t.status === "READY"
                              ? "checkmark-circle"
                              : t.status === "IN_PROGRESS"
                              ? "flame"
                              : t.status === "COMPLETED"
                              ? "checkmark-done"
                              : t.status === "CANCELLED"
                              ? "close-circle"
                              : "ellipse"
                          }
                          size={14}
                          color={pill.fg}
                        />
                        <Text
                          style={{
                            color: pill.fg,
                            fontWeight: "900",
                            fontSize: 12,
                          }}
                        >
                          {pill.label}
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
                          Promised
                        </Text>
                        <Text
                          style={{
                            color: CFA.ink,
                            fontWeight: "900",
                            marginTop: 4,
                          }}
                        >
                          {t.promisedMins} min
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
                          Ticket Time
                        </Text>
                        <Text
                          style={{
                            color: isLate ? CFA.danger : CFA.ink,
                            fontWeight: "900",
                            marginTop: 4,
                          }}
                        >
                          {t.status === "COMPLETED"
                            ? `${t.durationMins} min`
                            : "—"}
                        </Text>
                      </View>

                      <View
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 10,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: isLate
                            ? "rgba(229,22,54,0.22)"
                            : CFA.border,
                          backgroundColor: isLate
                            ? "rgba(229,22,54,0.06)"
                            : "rgba(11,18,32,0.02)",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 94,
                        }}
                      >
                        <Text
                          style={{
                            color: isLate ? CFA.red : CFA.muted,
                            fontWeight: "900",
                            fontSize: 12,
                          }}
                        >
                          {t.status === "COMPLETED"
                            ? isLate
                              ? "Late"
                              : "On time"
                            : "In flow"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
          )}
        </Card>

        {/* Alerts */}
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}>
            Alerts
          </Text>

          {computed.alerts.map((a, idx) => {
            const color =
              a.level === "danger"
                ? CFA.danger
                : a.level === "warn"
                ? CFA.warn
                : CFA.success;
            const icon =
              a.level === "danger"
                ? "alert-circle"
                : a.level === "warn"
                ? "warning"
                : "checkmark-circle";

            return (
              <View
                key={idx}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: CFA.border,
                  marginBottom: 10,
                  backgroundColor: "rgba(11,18,32,0.02)",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <Ionicons name={icon as any} size={18} color={color} />
                <Text style={{ color, fontWeight: "900", flex: 1 }}>
                  {a.text}
                </Text>
              </View>
            );
          })}
        </Card>

        {/* Shift notes */}
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 6 }}>
            Shift Notes
          </Text>
          <Text style={{ color: CFA.muted }}>
            Quick notes for staffing, quality, and ops (UI-only for now).
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            {(["Ops", "Staffing", "Quality", "Supply"] as Note["tag"][]).map(
              (t) => (
                <Chip
                  key={t}
                  text={t}
                  active={noteTag === t}
                  onPress={() => setNoteTag(t)}
                />
              )
            )}
          </View>

          <View
            style={{
              marginTop: 12,
              borderWidth: 1,
              borderColor: CFA.border,
              borderRadius: 16,
              backgroundColor: "rgba(11,18,32,0.02)",
              padding: 12,
            }}
          >
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a note (e.g., “Need 1 more runner at 12:00”)"
              placeholderTextColor="rgba(11,18,32,0.40)"
              multiline
              style={{ color: CFA.ink, fontWeight: "800", minHeight: 54 }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text
                style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}
              >
                Tag: {noteTag}
              </Text>

              <Pressable
                onPress={addNote}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  backgroundColor: CFA.red,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  opacity: noteText.trim() ? 1 : 0.6,
                }}
                disabled={!noteText.trim()}
              >
                <Ionicons name="add-circle" size={16} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}
                >
                  Add Note
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            {notes.length === 0 ? (
              <View style={{ paddingVertical: 14, alignItems: "center" }}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color={CFA.muted}
                />
                <Text
                  style={{ color: CFA.muted, marginTop: 8, fontWeight: "800" }}
                >
                  No notes yet.
                </Text>
              </View>
            ) : (
              notes
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((n, idx) => (
                  <View
                    key={n.id}
                    style={{
                      paddingVertical: 12,
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: CFA.border,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 10,
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
                      }}
                    >
                      <Text
                        style={{
                          color: CFA.muted,
                          fontWeight: "900",
                          fontSize: 12,
                        }}
                      >
                        {n.tag}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: CFA.ink, fontWeight: "800" }}>
                        {n.text}
                      </Text>
                      <Text
                        style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}
                      >
                        {new Date(n.createdAt).toLocaleString()}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => removeNote(n.id)}
                      hitSlop={12}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(229,22,54,0.22)",
                        backgroundColor: "rgba(229,22,54,0.06)",
                      }}
                    >
                      <Ionicons name="trash" size={18} color={CFA.red} />
                    </Pressable>
                  </View>
                ))
            )}
          </View>
        </Card>

        <Text style={{ color: CFA.muted, marginTop: 12, fontSize: 12 }}>
          UI-only: operations data is mocked. Next we’ll wire real order/ticket
          endpoints from catering-api.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
