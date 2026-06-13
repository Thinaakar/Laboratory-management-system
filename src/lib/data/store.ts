import type {
  DashboardKpis,
  TestResult,
} from '@/lib/types/lims';
import { seedPatients } from './patients-store';
import { seedOrders, seedInvoices } from './orders-store';
import { getSamples, seedSamples } from './samples-store';

const today = new Date().toISOString().slice(0, 10);

function dateOffset(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const date = d.toISOString().slice(0, 10);
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

export const seedResults: TestResult[] = [
  {
    id: 'RES-001',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'TST-CBC',
    testName: 'Complete Blood Count',
    value: '7.2',
    unit: 'cells/µL',
    referenceRange: '4.5–11.0',
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T10:30:00`,
  },
  {
    id: 'RES-002',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'TST-FBS',
    testName: 'Fasting Blood Sugar',
    value: '118',
    unit: 'mg/dL',
    referenceRange: '70–100',
    isCritical: true,
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T10:35:00`,
  },
  {
    id: 'RES-003',
    sampleId: 'SMP-2026-0003',
    orderId: 'ORD-2026-0003',
    testId: 'TST-TSH',
    testName: 'Thyroid Profile (TSH)',
    value: '4.8',
    unit: 'mIU/L',
    referenceRange: '0.4–4.0',
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T11:10:00`,
  },
  {
    id: 'RES-004',
    sampleId: 'SMP-2026-0004',
    orderId: 'ORD-2026-0004',
    testId: 'TST-CBC',
    testName: 'Complete Blood Count',
    value: '5.9',
    unit: 'cells/µL',
    referenceRange: '4.5–11.0',
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T12:00:00`,
  },
  {
    id: 'RES-005',
    sampleId: 'SMP-2026-0005',
    orderId: 'ORD-2026-0004',
    testId: 'TST-LFT',
    testName: 'Liver Function Test',
    value: '—',
    queueStatus: 'Processing',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T12:15:00`,
  },
  {
    id: 'RES-006',
    sampleId: 'SMP-2026-0006',
    orderId: 'ORD-2026-0002',
    testId: 'TST-LFT',
    testName: 'Liver Function Test',
    value: '—',
    queueStatus: 'Pending',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T12:30:00`,
  },
  {
    id: 'RES-007',
    sampleId: 'SMP-2026-0007',
    orderId: 'ORD-2026-0005',
    testId: 'TST-FBS',
    testName: 'Fasting Blood Sugar',
    value: '—',
    queueStatus: 'Pending',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T13:00:00`,
  },
  {
    id: 'RES-008',
    sampleId: 'SMP-2026-0008',
    orderId: 'ORD-2026-0005',
    testId: 'TST-TSH',
    testName: 'Thyroid Profile (TSH)',
    value: '—',
    queueStatus: 'Assigned',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T13:05:00`,
  },
  {
    id: 'RES-009',
    sampleId: 'SMP-2026-0002',
    orderId: 'ORD-2026-0002',
    testId: 'TST-LFT',
    testName: 'Liver Function Test',
    value: '—',
    queueStatus: 'Assigned',
    approvalStatus: 'Pending',
    enteredBy: 'Arun Kumar',
    enteredAt: `${today}T09:45:00`,
  },
  {
    id: 'RES-010',
    sampleId: 'SMP-2026-0038',
    orderId: 'ORD-2026-0003',
    testId: 'TST-CBC',
    testName: 'Complete Blood Count',
    value: '6.4',
    unit: 'cells/µL',
    referenceRange: '4.5–11.0',
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Arun Kumar',
    enteredAt: dateOffset(1, 15, 0),
    approvedBy: 'Dr. Meera Iyer',
    approvedAt: dateOffset(1, 16, 30),
  },
  {
    id: 'RES-011',
    sampleId: 'SMP-2026-0039',
    orderId: 'ORD-2026-0001',
    testId: 'TST-FBS',
    testName: 'Fasting Blood Sugar',
    value: '92',
    unit: 'mg/dL',
    referenceRange: '70–100',
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Arun Kumar',
    enteredAt: dateOffset(2, 11, 30),
    approvedBy: 'Dr. Meera Iyer',
    approvedAt: dateOffset(2, 14, 0),
  },
];

export function getDashboardKpis(): DashboardKpis {
  return {
    totalPatients: seedPatients.length,
    todayRegistrations: seedPatients.filter((p) => p.createdAt.startsWith(today)).length,
    todaySamples: getSamples().filter((s) => s.createdAt.startsWith(today)).length,
    pendingTests: seedResults.filter((r) => r.approvalStatus === 'Pending').length,
    completedReports: seedResults.filter((r) => r.approvalStatus === 'Approved').length,
    revenueToday: seedInvoices.filter((i) => i.createdAt.startsWith(today)).reduce((s, i) => s + i.paidAmount, 0),
    monthlyRevenue: 284500,
    outstandingPayments: seedInvoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + (i.amount - i.paidAmount), 0),
  };
}

export interface PendingTestRow {
  id: string;
  label: string;
  status: string;
}

/** Tests awaiting approval or still in the lab queue */
export function getPendingTestRows(): PendingTestRow[] {
  const pendingResults = seedResults
    .filter((r) => r.approvalStatus === 'Pending')
    .map((r) => ({
      id: r.id,
      label: `${r.testName} — ${r.sampleId.replace('SMP-2026-', 'SMP-')}`,
      status: r.queueStatus === 'Completed' ? 'Pending Approval' : r.queueStatus,
    }));

  const coveredTestKeys = new Set(seedResults.map((r) => `${r.orderId}:${r.testId}`));
  const queuedFromOrders = seedOrders.flatMap((order) =>
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

export interface SampleTrendDay {
  label: string;
  count: number;
  heightPct: number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/** Last 7 days sample counts with labels for the dashboard bar chart */
export function getSampleTrend(): SampleTrendDay[] {
  const days: SampleTrendDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = getSamples().filter((s) => s.createdAt.startsWith(key)).length;
    const label = WEEKDAY_LABELS[d.getDay()];
    days.push({ label, count, heightPct: 0 });
  }
  const max = Math.max(...days.map((day) => day.count), 1);
  return days.map((day) => ({
    ...day,
    heightPct: day.count === 0 ? 10 : Math.max(22, Math.round((day.count / max) * 100)),
  }));
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
export function getResults() { return seedResults; }

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
