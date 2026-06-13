import {
  getAppointments,
  getDashboardKpis,
  getInventory,
  getInvoices,
  getOrders,
  getPatients,
  getResults,
  getSampleTrend,
  getSamples,
  getTests,
  getUsers,
} from '@/lib/data/store';

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
  kpis: {
    totalPatients: number;
    totalSamples: number;
    totalOrders: number;
    monthlyRevenue: number;
    revenueToday: number;
    pendingTests: number;
    completedReports: number;
    outstandingPayments: number;
    todayAppointments: number;
    activeStaff: number;
    lowStockItems: number;
  };
  sampleTrend: BarChartItem[];
  revenueTrend: BarChartItem[];
  topTests: BarChartItem[];
  reportStatus: ChartSlice[];
  paymentStatus: ChartSlice[];
  sampleStatus: ChartSlice[];
  orderStatus: ChartSlice[];
  departmentMix: ChartSlice[];
}

const PIE_COLORS = {
  primary: '#53bdeb',
  emerald: '#34d399',
  mild: '#94a3b8',
  violet: '#8b5cf6',
  rose: '#f87171',
  slate: '#cbd5e1',
  cyan: '#38bdf8',
  soft: '#a5b4fc',
};

/** Mild, fixed colors per sample stage (Sample Pipeline chart) */
const SAMPLE_STATUS_COLORS: Record<string, string> = {
  Completed: PIE_COLORS.primary,
  Processing: PIE_COLORS.cyan,
  Registered: PIE_COLORS.violet,
  Collected: PIE_COLORS.mild,
  Received: PIE_COLORS.emerald,
};

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

function last7DayKeys(): string[] {
  const keys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function dayLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short' });
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot {
  const kpis = getDashboardKpis();
  const patients = getPatients();
  const samples = getSamples();
  const orders = getOrders();
  const invoices = getInvoices();
  const results = getResults();
  const tests = getTests();
  const users = getUsers();
  const inventory = getInventory();
  const appointments = getAppointments();
  const today = new Date().toISOString().slice(0, 10);

  const sampleTrend = getSampleTrend().map((d) => ({ label: d.label, value: d.count }));

  const revenueTrend = last7DayKeys().map((key) => ({
    label: dayLabel(key),
    value: invoices
      .filter((i) => i.createdAt.startsWith(key))
      .reduce((sum, i) => sum + i.paidAmount, 0),
  }));

  const topTests = tests
    .map((t) => ({
      label: t.name.length > 18 ? `${t.name.slice(0, 16)}…` : t.name,
      value: orders.filter((o) => o.testIds.includes(t.id)).length,
    }))
    .sort((a, b) => b.value - a.value);

  const reportStatus = countByField(
    results,
    (r) => r.approvalStatus,
    [PIE_COLORS.mild, PIE_COLORS.emerald, PIE_COLORS.rose],
  );

  const paymentStatus = countByField(
    invoices,
    (i) => i.status,
    [PIE_COLORS.emerald, PIE_COLORS.mild, PIE_COLORS.violet],
  );

  const sampleStatus = countByField(
    samples,
    (s) => s.status,
    [PIE_COLORS.primary, PIE_COLORS.cyan, PIE_COLORS.violet, PIE_COLORS.mild, PIE_COLORS.emerald],
  ).map((slice) => ({
    ...slice,
    color: SAMPLE_STATUS_COLORS[slice.label] ?? slice.color,
  }));

  const orderStatus = countByField(
    orders,
    (o) => o.status,
    [PIE_COLORS.mild, PIE_COLORS.primary, PIE_COLORS.emerald, PIE_COLORS.slate],
  );

  const departmentMix = countByField(
    tests,
    (t) => t.departmentName,
    [PIE_COLORS.primary, PIE_COLORS.emerald, PIE_COLORS.violet, PIE_COLORS.soft, PIE_COLORS.rose],
  ).map((slice) => ({
    ...slice,
    value: orders.reduce(
      (sum, o) =>
        sum + o.testIds.filter((id) => tests.find((t) => t.id === id)?.departmentName === slice.label).length,
      0,
    ),
  }));

  return {
    kpis: {
      totalPatients: patients.length,
      totalSamples: samples.length,
      totalOrders: orders.length,
      monthlyRevenue: kpis.monthlyRevenue,
      revenueToday: kpis.revenueToday,
      pendingTests: kpis.pendingTests,
      completedReports: kpis.completedReports,
      outstandingPayments: kpis.outstandingPayments,
      todayAppointments: appointments.filter((a) => a.scheduledAt.startsWith(today)).length,
      activeStaff: users.filter((u) => u.status === 'Active').length,
      lowStockItems: inventory.filter((i) => i.quantity <= i.reorderLevel).length,
    },
    sampleTrend,
    revenueTrend,
    topTests,
    reportStatus,
    paymentStatus,
    sampleStatus,
    orderStatus,
    departmentMix: departmentMix.filter((d) => d.value > 0),
  };
}
