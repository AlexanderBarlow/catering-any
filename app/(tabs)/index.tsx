import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { LineChart } from "react-native-gifted-charts";
import { router } from "expo-router";

import { CFA } from "../../constants/theme";
import { api, type OverviewRange } from "../../src/api";
import { useSession } from "../../hooks/useSession";
import TabScreenTransition from "../../components/TabScreenTransition";


function money(n: number) {
  return `$${Number(n || 0).toLocaleString()}`;
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

function KPICard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card style={{ flex: 1 }}>
      <Text style={{ color: CFA.muted, fontSize: 12, fontWeight: "800" }}>
        {label}
      </Text>
      <Text
        style={{
          color: CFA.ink,
          fontSize: 24,
          fontWeight: "900",
          marginTop: 6,
        }}
      >
        {value}
      </Text>
      {sub ? (
        <Text style={{ color: CFA.muted, marginTop: 6, fontSize: 12 }}>
          {sub}
        </Text>
      ) : null}
    </Card>
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

export default function Dashboard() {
  const { user, signOut } = useSession();
  const [range, setRange] = useState<OverviewRange>("7d");

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;

  // iPad landscape “wide mode” only (iPhones stay single column)
  const isWide = isLandscape && width >= 900;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["overview", range],
    queryFn: () => api.getOverview({ range }),
  });

  const series = useMemo(() => {
    const s = data?.revenueSeries || [];
    return s.map((p) => ({ value: p.value, label: p.label }));
  }, [data]);

  // Notch/rounded-corner safe horizontal padding (landscape especially)
  const sidePad = 16 + Math.max(insets.left, insets.right);

  // Keep content clear of floating tab bar + home indicator
  const bottomPadForNav = insets.bottom + (isWide ? 110 : 98);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      // Ensure we leave tabs immediately after clearing session
      router.replace("/(auth)/login");
    }
  };

  const Header = (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: CFA.ink }}>
            Dashboard
          </Text>
          <Text style={{ color: CFA.muted, marginTop: 4 }}>
            {user?.name} • {user?.role}
          </Text>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: CFA.border,
            backgroundColor: CFA.card,
          }}
        >
          <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
            Sign out
          </Text>
        </Pressable>
      </View>

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

        <Pressable
          onPress={() => refetch()}
          style={{
            marginLeft: "auto",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: CFA.border,
            backgroundColor: CFA.card,
          }}
        >
          <Text style={{ color: CFA.muted, fontWeight: "900", fontSize: 12 }}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Text>
        </Pressable>
      </View>
    </>
  );

  const KPIBlock = (
    <>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
        <KPICard
          label="Revenue Today"
          value={isLoading ? "—" : money(data?.kpis?.revenueToday ?? 0)}
          sub={
            isLoading ? "" : `Period: ${money(data?.kpis?.revenuePeriod ?? 0)}`
          }
        />
        <KPICard
          label="Orders Today"
          value={isLoading ? "—" : String(data?.kpis?.ordersToday ?? 0)}
          sub={isLoading ? "" : `Period: ${data?.kpis?.ordersPeriod ?? 0}`}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
        <KPICard
          label="Avg Ticket Time"
          value={isLoading ? "—" : `${data?.kpis?.avgTicketMins ?? 0} min`}
          sub="Created → Completed"
        />
        <KPICard
          label="Estimated Margin"
          value={
            isLoading ? "—" : `${(data?.kpis?.marginPct ?? 0).toFixed(1)}%`
          }
          sub="Uses item cost + price"
        />
      </View>
    </>
  );

  const RevenueChart = (
    <Card style={{ marginTop: 14 }}>
      <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}>
        Revenue Trend
      </Text>

      <LineChart
        data={series.length ? series : [{ value: 0, label: "" }]}
        height={isWide ? 220 : isLandscape ? 160 : 180}
        thickness={3}
        hideRules
        xAxisColor={CFA.border}
        yAxisColor={CFA.border}
        yAxisTextStyle={{ color: CFA.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: CFA.muted, fontSize: 10 }}
        isAnimated={false}
        animateOnDataChange={false}
        initialSpacing={10}
        spacing={38}
        hideDataPoints
      />
    </Card>
  );

  const TopItems = (
    <Card style={{ marginTop: 14 }}>
      <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}>
        Top Items
      </Text>

      {(data?.topItems || []).map((it) => (
        <View
          key={it.name}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: CFA.border,
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: CFA.ink, fontWeight: "800" }}>{it.name}</Text>
            <Text style={{ color: CFA.muted, marginTop: 2, fontSize: 12 }}>
              {it.qty} sold
            </Text>
          </View>
          <Text style={{ color: CFA.red, fontWeight: "900" }}>
            {money(it.revenue)}
          </Text>
        </View>
      ))}
    </Card>
  );

  const Alerts = (
    <Card style={{ marginTop: 14 }}>
      <Text style={{ color: CFA.ink, fontWeight: "900", marginBottom: 10 }}>
        Alerts
      </Text>

      {(data?.alerts || []).map((a, idx) => {
        const color =
          a.level === "danger"
            ? CFA.danger
            : a.level === "warn"
            ? CFA.warn
            : CFA.success;

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
            }}
          >
            <Text style={{ color, fontWeight: "900" }}>{a.text}</Text>
          </View>
        );
      })}
    </Card>
  );

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
          {Header}

          {!isWide ? (
            <>
              {KPIBlock}
              {RevenueChart}
              {TopItems}
              {Alerts}

              <Text style={{ color: CFA.muted, marginTop: 12, fontSize: 12 }}>
                Note: data is mock right now. We’ll swap to catering-api
                endpoints later.
              </Text>
            </>
          ) : (
            <View style={{ flexDirection: "row", gap: 14, marginTop: 2 }}>
              <View style={{ flex: 1 }}>
                {KPIBlock}
                {TopItems}
              </View>

              <View style={{ flex: 1 }}>
                {RevenueChart}
                {Alerts}

                <Text style={{ color: CFA.muted, marginTop: 12, fontSize: 12 }}>
                  Note: data is mock right now. We’ll swap to catering-api
                  endpoints later.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </TabScreenTransition>
  );
}
