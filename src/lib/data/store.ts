import type { DashboardKpis, LabOrder, Sample, TestResult } from '@/lib/types/lims';
import { getPatients } from './patients-store';
import { getOrders, getInvoices } from './orders-store';
import { getSamples } from './samples-store';
import { getResults } from './results-store';

const today = new Date().toISOString().slice(0, 10);

export { seedResults } from './results-store';

export function getDashboardKpis(): DashboardKpis {
  const patients = getPatients();
  const samples = getSamples();
  const results = getResults();
  const invoices = getInvoices();
  const monthStart = today.slice(0, 7);

  return {
    totalPatients: patients.length,
    todayRegistrations: patients.filter((p) => p.createdAt.startsWith(today)).length,
    todaySamples: samples.filter((s) => s.createdAt.startsWith(today)).length,
    pendingTests: results.filter((r) => r.approvalStatus === 'Pending').length,
    completedReports: results.filter((r) => r.approvalStatus === 'Approved').length,
    revenueToday: invoices
      .filter((i) => i.createdAt.startsWith(today))
      .reduce((s, i) => s + i.paidAmount, 0),
    monthlyRevenue: invoices
      .filter((i) => i.createdAt.startsWith(monthStart))
      .reduce((s, i) => s + i.paidAmount, 0),
    outstandingPayments: invoices
      .filter((i) => i.status !== 'Paid')
      .reduce((s, i) => s + (i.amount - i.paidAmount), 0),
  };
}

export interface PendingTestRow {
  id: string;
  label: string;
  status: string;
}

export function buildPendingTestRows(
  results: TestResult[],
  orders: LabOrder[],
): PendingTestRow[] {
  const pendingResults = results
    .filter((r) => r.approvalStatus === 'Pending')
    .map((r) => ({
      id: r.id,
      label: `${r.testName} — ${r.sampleId.replace('SMP-2026-', 'SMP-')}`,
      status: r.queueStatus === 'Completed' ? 'Pending Approval' : r.queueStatus,
    }));

  const coveredTestKeys = new Set(results.map((r) => `${r.orderId}:${r.testId}`));
  const queuedFromOrders = orders.flatMap((order) =>
    order.testIds
      .map((testId, i) => ({ testId, testName: order.testNames[i] ?? testId }))
      .filter(({ testId }) => {
        if (coveredTestKeys.has(`${order.id}:${testId}`)) return false;
        return order.status === 'Pending' || order.status === 'Processing';
      })
      .map(({ testId, testName }) => ({
        id: `${order.id}-${testId}`,
        label: `${testName} — ${order.id.replace('ORD-2026-', 'ORD-')}`,
        status: order.status === 'Pending' ? 'Pending' : 'Processing',
      })),
  );

  return [...pendingResults, ...queuedFromOrders].slice(0, 9);
}

/** Tests awaiting approval or still in the lab queue */
export function getPendingTestRows(): PendingTestRow[] {
  return buildPendingTestRows(getResults(), getOrders());
}

export interface SampleTrendDay {
  label: string;
  count: number;
  heightPct: number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function buildSampleTrend(samples: Sample[]): SampleTrendDay[] {
  const days: SampleTrendDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = samples.filter((s) => s.createdAt.startsWith(key)).length;
    const label = WEEKDAY_LABELS[d.getDay()];
    days.push({ label, count, heightPct: 0 });
  }
  const max = Math.max(...days.map((day) => day.count), 1);
  return days.map((day) => ({
    ...day,
    heightPct: day.count === 0 ? 10 : Math.max(22, Math.round((day.count / max) * 100)),
  }));
}

/** Last 7 days sample counts with labels for the dashboard bar chart */
export function getSampleTrend(): SampleTrendDay[] {
  return buildSampleTrend(getSamples());
}

/** @deprecated Use getSampleTrend() */
export function getSampleTrendBars(): number[] {
  return getSampleTrend().map((d) => d.heightPct);
}

export {
  getSamples,
  seedSamples,
  addSample,
  updateSample,
  deleteSample,
  getNextBarcode,
} from './samples-store';
export { getResults, enterResultLocal, approveResultLocal, rejectResultLocal } from './results-store';

export {
  seedAuditLogs,
  getAuditLogs,
  addAuditLog,
} from './audit-store';

export {
  seedDepartments,
  getDepartments,
  addDepartment,
} from './departments-store';
export {
  seedSampleTypes,
  getSampleTypes,
  getActiveSampleTypes,
  addSampleType,
  updateSampleType,
  deleteSampleType,
} from './sample-types-store';
export {
  seedTests,
  getTests,
  addTest,
} from './tests-store';
export {
  seedPackages,
  getPackages,
  addPackage,
} from './packages-store';
export {
  seedReferrals,
  getReferrals,
  addReferral,
} from './referrals-store';
export {
  seedBranches,
  getBranches,
  addBranch,
} from './branches-store';

export {
  getOrders,
  seedOrders,
  addOrder,
  getInvoices,
  seedInvoices,
  addInvoice,
  recordInvoicePayment,
} from './orders-store';
export {
  getAppointments,
  seedAppointments,
  addBooking,
} from './appointments-store';
export {
  getPatients,
  seedPatients,
  addPatient,
  getNextPatientId,
} from './patients-store';
export {
  getInventory,
  seedInventory,
  addInventoryItem,
} from './inventory-store';
export {
  getSuppliers,
  seedSuppliers,
  addSupplier,
} from './suppliers-store';
export {
  getEquipment,
  seedEquipment,
  addEquipment,
} from './equipment-store';
export { getUsers, seedUsers } from './users-store';
