import type {
  AuditLogEntry,
  DashboardKpis,
  DoctorReferral,
  HealthPackage,
  LabTest,
  Sample,
  TestDepartment,
  TestResult,
  Branch,
} from '@/lib/types/lims';
import { seedPatients } from './patients-store';
import { seedOrders, seedInvoices } from './orders-store';

const today = new Date().toISOString().slice(0, 10);

function dateOffset(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const date = d.toISOString().slice(0, 10);
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

/** Samples per day for the last 7 days (index 0 = oldest, 6 = today) */
const TREND_DAY_COUNTS = [5, 7, 6, 10, 8, 11, 9];

export const seedDepartments: TestDepartment[] = [
  { id: 'DEPT-HEM', name: 'Hematology', code: 'HEM' },
  { id: 'DEPT-BIO', name: 'Biochemistry', code: 'BIO' },
  { id: 'DEPT-MIC', name: 'Microbiology', code: 'MIC' },
  { id: 'DEPT-SER', name: 'Serology', code: 'SER' },
  { id: 'DEPT-PAT', name: 'Pathology', code: 'PAT' },
];

export const seedTests: LabTest[] = [
  { id: 'TST-CBC', name: 'Complete Blood Count', departmentId: 'DEPT-HEM', departmentName: 'Hematology', price: 450, sampleType: 'Blood', turnaroundHours: 4, unit: 'cells/µL', referenceRange: '4.5–11.0', isActive: true },
  { id: 'TST-FBS', name: 'Fasting Blood Sugar', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 120, sampleType: 'Blood', turnaroundHours: 2, unit: 'mg/dL', referenceRange: '70–100', isActive: true },
  { id: 'TST-LFT', name: 'Liver Function Test', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 850, sampleType: 'Blood', turnaroundHours: 6, isActive: true },
  { id: 'TST-TSH', name: 'Thyroid Profile (TSH)', departmentId: 'DEPT-SER', departmentName: 'Serology', price: 350, sampleType: 'Blood', turnaroundHours: 24, unit: 'mIU/L', referenceRange: '0.4–4.0', isActive: true },
];

function buildSeedSamples(): Sample[] {
  const statuses: Sample['status'][] = ['Registered', 'Collected', 'Received', 'Processing', 'Completed'];
  const patients = seedPatients;
  let seq = 1;
  const samples: Sample[] = [];

  TREND_DAY_COUNTS.forEach((count, dayIndex) => {
    const daysAgo = 6 - dayIndex;
    for (let i = 0; i < count; i++) {
      const patient = patients[(seq - 1) % patients.length];
      const status = daysAgo === 0
        ? statuses[i % 4]
        : daysAgo <= 1
          ? 'Processing'
          : 'Completed';
      const createdAt = dateOffset(daysAgo, 8 + (i % 9), (i * 7) % 60);
      const id = `SMP-2026-${String(seq).padStart(4, '0')}`;
      samples.push({
        id,
        orderId: seq <= 2 ? `ORD-2026-000${seq}` : `ORD-2026-000${((seq - 1) % 5) + 1}`,
        patientId: patient.id,
        patientName: patient.name,
        barcode: `BC2026${String(seq).padStart(4, '0')}`,
        sampleType: i % 5 === 0 ? 'Urine' : 'Blood',
        status,
        collectedAt: status !== 'Registered' ? createdAt.replace(/T(\d+)/, (_, h) => `T${String(Number(h) + 1).padStart(2, '0')}`) : undefined,
        receivedAt: ['Received', 'Processing', 'Completed'].includes(status)
          ? dateOffset(daysAgo, 9 + (i % 8), 15)
          : undefined,
        createdAt,
      });
      seq += 1;
    }
  });

  return samples;
}

export const seedSamples: Sample[] = buildSeedSamples();

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
  },
];

export function getDashboardKpis(): DashboardKpis {
  return {
    totalPatients: seedPatients.length,
    todayRegistrations: seedPatients.filter((p) => p.createdAt.startsWith(today)).length,
    todaySamples: seedSamples.filter((s) => s.createdAt.startsWith(today)).length,
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

/** Last 7 days sample counts with labels for the dashboard bar chart */
export function getSampleTrend(): SampleTrendDay[] {
  const days: SampleTrendDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = seedSamples.filter((s) => s.createdAt.startsWith(key)).length;
    const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
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

export function getSamples() { return seedSamples; }
export function getResults() { return seedResults; }
export function getTests() { return seedTests; }
export function getDepartments() { return seedDepartments; }

export const seedBranches: Branch[] = [
  { id: 'BR-MAIN', name: 'Main Laboratory', code: 'MAIN', address: '123 Health Park, Mumbai', phone: '+91 22 4000 1234', isActive: true },
];

export const seedPackages: HealthPackage[] = [
  { id: 'PKG-BASIC', name: 'Basic Health Checkup', testIds: ['TST-CBC', 'TST-FBS'], price: 520, description: 'CBC + Fasting Blood Sugar' },
  { id: 'PKG-EXEC', name: 'Executive Profile', testIds: ['TST-CBC', 'TST-LFT', 'TST-TSH'], price: 1450, description: 'Comprehensive metabolic panel' },
];

export const seedReferrals: DoctorReferral[] = [
  { id: 'REF-001', doctorName: 'Dr. Anil Kapoor', specialty: 'General Physician', phone: '+91 98765 33333', referralCount: 48, revenueGenerated: 125000 },
  { id: 'REF-002', doctorName: 'Dr. Sunita Rao', specialty: 'Endocrinologist', phone: '+91 98765 44444', referralCount: 22, revenueGenerated: 78000 },
];

export const seedAuditLogs: AuditLogEntry[] = [
  { id: 'AUD-001', userId: 'USR-RECEP', userName: 'Priya Sharma', action: 'CREATE', module: 'patients', timestamp: `${today}T08:30:00`, details: 'Registered PAT-000001' },
  { id: 'AUD-002', userId: 'USR-LAB', userName: 'Arun Kumar', action: 'UPDATE', module: 'results', timestamp: `${today}T10:35:00`, details: 'Entered results for SMP-2026-0001' },
  { id: 'AUD-003', userId: 'USR-ADMIN', userName: 'System Admin', action: 'LOGIN', module: 'auth', timestamp: `${today}T08:00:00`, ipAddress: '192.168.1.10' },
];

export function getBranches() { return seedBranches; }
export function getPackages() { return seedPackages; }
export function getReferrals() { return seedReferrals; }
export function getAuditLogs() { return seedAuditLogs; }

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
  addAppointment,
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
