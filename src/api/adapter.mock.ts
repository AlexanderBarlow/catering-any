import type { Session, SessionUser } from "../auth/session";

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type OverviewRange = "1d" | "7d" | "30d" | "ytd";

export type OverviewResponse = {
  range: OverviewRange;
  kpis: {
    revenueToday: number;
    ordersToday: number;
    avgTicketMins: number;
    marginPct: number;
    revenuePeriod: number;
    ordersPeriod: number;
  };
  revenueSeries: { label: string; value: number }[];
  topItems: { name: string; qty: number; revenue: number }[];
  alerts: { level: "danger" | "warn" | "success"; text: string }[];
};

export const mockAdapter = {
  async login(email: string, password: string): Promise<Session> {
    await wait(350);

    const lowered = email.trim().toLowerCase();
    const role: SessionUser["role"] = lowered.includes("admin")
      ? "ADMIN"
      : "MANAGER";

    return {
      token: "mock.jwt.token",
      user: {
        id: "u_1",
        email: lowered,
        name: role === "ADMIN" ? "Admin User" : "Manager User",
        role,
      },
    };
  },

  async getOverview({
    range,
  }: {
    range: OverviewRange;
  }): Promise<OverviewResponse> {
    await wait(220);

    const series7 = [
      { label: "Mon", value: 1500 },
      { label: "Tue", value: 3100 },
      { label: "Wed", value: 2200 },
      { label: "Thu", value: 2800 },
      { label: "Fri", value: 1600 },
      { label: "Sat", value: 1400 },
      { label: "Sun", value: 4300 },
    ];

    const series30 = Array.from({ length: 30 }).map((_, i) => ({
      label: String(i + 1),
      value: Math.round(1200 + Math.random() * 3200),
    }));

    const revenueSeries = range === "30d" ? series30 : series7;

    return {
      range,
      kpis: {
        revenueToday: 2450,
        ordersToday: 38,
        avgTicketMins: 12,
        marginPct: 31.4,
        revenuePeriod: range === "30d" ? 58340 : range === "1d" ? 2450 : 15320,
        ordersPeriod: range === "30d" ? 892 : range === "1d" ? 38 : 210,
      },
      revenueSeries,
      topItems: [
        { name: "Chicken Sandwich", qty: 85, revenue: 5525 },
        { name: "Nugget Tray (Large)", qty: 52, revenue: 7280 },
        { name: "Grilled Cool Wrap", qty: 34, revenue: 2890 },
        { name: "Gallon Sweet Tea", qty: 28, revenue: 980 },
      ],
      alerts: [
        { level: "danger", text: "5 late orders today" },
        { level: "warn", text: "15 unpaid orders (manual tracking)" },
        { level: "success", text: "Top item margin holding steady" },
      ],
    };
  },
};
