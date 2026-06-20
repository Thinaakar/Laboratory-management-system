import {
  getAppointments,
  getInventory,
  getInvoices,
  getOrders,
  getPatients,
  getResults,
  getSamples,
  getTests,
  getUsers,
} from "@/lib/data/store";

export type AnalyticsPeriod = "overall" | "monthly" | "weekly" | "daily";

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface BarChartItem {
  label: string;
  value: number;
}

export interface AnalyticsSnapshot {
  period: AnalyticsPeriod;
  periodLabel: string;
  kpis: {
    totalPatients: number;
    totalSamples: number;
    totalOrders: number;
    periodRevenue: number;
    pendingTests: number;
    completedReports: number;
    outstandingPayments: number;
    periodAppointments: number;
    activeStaff: number;
    lowStockItems: number;
  };
  sampleTrend: BarChartItem[];
  revenueTrend: BarChartItem[];
  topTests: BarChartItem[];
  paymentStatus: ChartSlice[];
  sampleStatus: ChartSlice[];
  testStatus: ChartSlice[];
  departmentMix: ChartSlice[];
}

const PIE_COLORS = {
  primary: "#53bdeb",
  emerald: "#34d399",
  mild: "#94a3b8",
  violet: "#8b5cf6",
  rose: "#f87171",
  slate: "#cbd5e1",
  cyan: "#38bdf8",
  soft: "#a5b4fc",
};

const SAMPLE_STATUS_COLORS: Record<string, string> = {
  Completed: PIE_COLORS.primary,
  Processing: PIE_COLORS.cyan,
  Registered: PIE_COLORS.violet,
  Collected: PIE_COLORS.mild,
  Received: PIE_COLORS.emerald,
};

export const ANALYTICS_PERIODS: { id: AnalyticsPeriod; label: string; description: string }[] = [
  { id: "overall", label: "Overall", description: "All-time performance" },
  { id: "monthly", label: "Monthly", description: "Current calendar month" },
  { id: "weekly", label: "Weekly", description: "Last 7 days" },
  { id: "daily", label: "Daily", description: "Today" },
];

function countByField<T>(
  items: T[],
  getKey: (item: T) => string,
  colors: string[],
): ChartSlice[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([label, value], i) => ({
    label,
    value,
    color: colors[i % colors.length],
  }));
}

function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function isInPeriod(isoDate: string, period: AnalyticsPeriod, now = new Date()): boolean {
  if (period === "overall") return true;
  if (!isoDate) return false;

  const dateKey = isoDate.slice(0, 10);
  const today = todayKey(now);

  if (period === "daily") return dateKey === today;

  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const itemDate = new Date(isoDate);
    return itemDate >= start && itemDate <= now;
  }

  if (period === "monthly") {
    return dateKey.slice(0, 7) === today.slice(0, 7);
  }

  return true;
}

function dayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-IN", { weekday: "short" });
}

function monthLabel(yearMonth: string): string {
  const d = new Date(`${yearMonth}-01T12:00:00`);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function hourSlot(iso: string): number {
  const h = new Date(iso).getHours();
  if (h < 9) return 0;
  if (h < 12) return 1;
  if (h < 15) return 2;
  if (h < 18) return 3;
  if (h < 21) return 4;
  return 5;
}

const DAILY_SLOT_LABELS = ["6–9 AM", "9 AM–12 PM", "12–3 PM", "3–6 PM", "6–9 PM", "9 PM–12 AM"];

function trendBuckets(
  period: AnalyticsPeriod,
  now = new Date(),
): { key: string; label: string; match: (iso: string) => boolean }[] {
  const today = todayKey(now);

  if (period === "daily") {
    return DAILY_SLOT_LABELS.map((label, index) => ({
      key: String(index),
      label,
      match: (iso) => isInPeriod(iso, "daily", now) && hourSlot(iso) === index,
    }));
  }

  if (period === "weekly") {
    const keys: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      keys.push(d.toISOString().slice(0, 10));
    }
    return keys.map((key) => ({
      key,
      label: dayLabel(key),
      match: (iso) => iso.startsWith(key),
    }));
  }

  if (period === "monthly") {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const buckets: { key: string; label: string; match: (iso: string) => boolean }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = d.toISOString().slice(0, 10);
      if (key > today) break;
      buckets.push({
        key,
        label: String(day),
        match: (iso) => iso.startsWith(key),
      });
    }
    return buckets;
  }

  const buckets: { key: string; label: string; match: (iso: string) => boolean }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    buckets.push({
      key,
      label: monthLabel(key),
      match: (iso) => iso.startsWith(key),
    });
  }
  return buckets;
}

function periodTrendSubtitle(period: AnalyticsPeriod): string {
  switch (period) {
    case "daily":
      return "Today — by time of day";
    case "weekly":
      return "Last 7 days";
    case "monthly":
      return "Current month — daily breakdown";
    default:
      return "Last 6 months";
  }
}

export function getAnalyticsSnapshot(period: AnalyticsPeriod = "overall"): AnalyticsSnapshot {
  const now = new Date();
  const patients = getPatients().filter((p) => isInPeriod(p.createdAt, period, now));
  const samples = getSamples().filter((s) => isInPeriod(s.createdAt, period, now));
  const orders = getOrders().filter((o) => isInPeriod(o.createdAt, period, now));
  const invoices = getInvoices().filter((i) => isInPeriod(i.createdAt, period, now));
  const results = getResults().filter((r) =>
    isInPeriod(r.enteredAt ?? r.approvedAt ?? "", period, now),
  );
  const appointments = getAppointments().filter((a) => isInPeriod(a.scheduledAt, period, now));
  const tests = getTests();
  const users = getUsers();
  const inventory = getInventory();

  const buckets = trendBuckets(period, now);

  const sampleTrend = buckets.map((bucket) => ({
    label: bucket.label,
    value: samples.filter((s) => bucket.match(s.createdAt)).length,
  }));

  const revenueTrend = buckets.map((bucket) => ({
    label: bucket.label,
    value: invoices
      .filter((i) => bucket.match(i.createdAt))
      .reduce((sum, i) => sum + i.paidAmount, 0),
  }));

  const topTests = tests
    .map((t) => ({
      label: t.name.length > 18 ? `${t.name.slice(0, 16)}…` : t.name,
      value: orders.filter((o) => o.testIds.includes(t.id)).length,
    }))
    .filter((t) => t.value > 0)
    .sort((a, b) => b.value - a.value);

  const paymentStatus = countByField(invoices, (i) => i.status, [
    PIE_COLORS.emerald,
    PIE_COLORS.mild,
    PIE_COLORS.violet,
  ]);

  const sampleStatus = countByField(samples, (s) => s.status, [
    PIE_COLORS.primary,
    PIE_COLORS.cyan,
    PIE_COLORS.violet,
    PIE_COLORS.mild,
    PIE_COLORS.emerald,
  ]).map((slice) => ({
    ...slice,
    color: SAMPLE_STATUS_COLORS[slice.label] ?? slice.color,
  }));

  const testStatus = countByField(results, (r) => r.queueStatus, [
    PIE_COLORS.mild,
    PIE_COLORS.cyan,
    PIE_COLORS.violet,
    PIE_COLORS.emerald,
  ]);

  const departmentMix = countByField(tests, (t) => t.departmentName, [
    PIE_COLORS.primary,
    PIE_COLORS.emerald,
    PIE_COLORS.violet,
    PIE_COLORS.soft,
    PIE_COLORS.rose,
  ]).map((slice) => ({
    ...slice,
    value: orders.reduce(
      (sum, o) =>
        sum +
        o.testIds.filter(
          (id) => tests.find((t) => t.id === id)?.departmentName === slice.label,
        ).length,
      0,
    ),
  }));

  const periodRevenue = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const outstandingPayments = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

  const periodMeta = ANALYTICS_PERIODS.find((p) => p.id === period)!;

  return {
    period,
    periodLabel: periodMeta.label,
    kpis: {
      totalPatients: patients.length,
      totalSamples: samples.length,
      totalOrders: orders.length,
      periodRevenue,
      pendingTests: results.filter((r) => r.approvalStatus === "Pending").length,
      completedReports: results.filter((r) => r.approvalStatus === "Approved").length,
      outstandingPayments,
      periodAppointments: appointments.length,
      activeStaff: users.filter((u) => u.status === "Active").length,
      lowStockItems: inventory.filter((i) => i.quantity <= i.reorderLevel).length,
    },
    sampleTrend,
    revenueTrend,
    topTests,
    paymentStatus,
    sampleStatus,
    testStatus,
    departmentMix: departmentMix.filter((d) => d.value > 0),
  };
}

export function getAnalyticsTrendSubtitle(period: AnalyticsPeriod): string {
  return periodTrendSubtitle(period);
}

export function analyticsSnapshotCsvRows(
  snapshot: AnalyticsSnapshot,
): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];
  const { kpis } = snapshot;

  const push = (section: string, label: string, value: string | number) => {
    rows.push({ Section: section, Label: label, Value: value });
  };

  push("Report", "Period", snapshot.periodLabel);

  [
    ["Patients registered", kpis.totalPatients],
    ["Samples processed", kpis.totalSamples],
    ["Lab orders", kpis.totalOrders],
    ["Revenue collected", kpis.periodRevenue],
    ["Pending approvals", kpis.pendingTests],
    ["Reports approved", kpis.completedReports],
    ["Outstanding dues", kpis.outstandingPayments],
    ["Appointments", kpis.periodAppointments],
    ["Active staff", kpis.activeStaff],
    ["Low stock alerts", kpis.lowStockItems],
  ].forEach(([label, value]) => push("KPIs", label as string, value as number));

  snapshot.sampleTrend.forEach((item) =>
    push("Sample Volume", item.label, item.value),
  );
  snapshot.revenueTrend.forEach((item) =>
    push("Revenue Collected", item.label, item.value),
  );
  snapshot.topTests.forEach((item) => push("Top Tests", item.label, item.value));
  snapshot.paymentStatus.forEach((item) =>
    push("Payment Status", item.label, item.value),
  );
  snapshot.sampleStatus.forEach((item) =>
    push("Sample Pipeline", item.label, item.value),
  );
  snapshot.testStatus.forEach((item) =>
    push("Tests by Status", item.label, item.value),
  );
  snapshot.departmentMix.forEach((item) =>
    push("Tests by Department", item.label, item.value),
  );

  return rows;
}

/** @deprecated Use getAnalyticsSnapshot(period) */
export function getAnalyticsOverview(period: AnalyticsPeriod = "overall"): AnalyticsSnapshot {
  return getAnalyticsSnapshot(period);
}
