import type { TestResult } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-results-v1';
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

function cloneSeed(): TestResult[] {
  return seedResults.map((r) => ({ ...r }));
}

function loadResults(): TestResult[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as TestResult[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveResults(results: TestResult[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

let memoryResults = cloneSeed();

export function getResults(): TestResult[] {
  if (typeof window !== 'undefined') {
    memoryResults = loadResults();
  }
  return memoryResults.map((r) => ({ ...r }));
}

export function getResultById(id: string): TestResult | undefined {
  return getResults().find((r) => r.id === id);
}

export function enterResultLocal(input: {
  resultId: string;
  value: string;
  unit?: string;
  isCritical?: boolean;
  enteredBy?: string;
}): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === input.resultId);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    value: input.value.trim(),
    unit: input.unit?.trim() || results[index].unit,
    isCritical: input.isCritical ?? false,
    queueStatus: 'Completed',
    enteredBy: input.enteredBy ?? results[index].enteredBy,
    enteredAt: new Date().toISOString(),
    approvalStatus: 'Pending',
  };
  memoryResults = results.map((r) => (r.id === input.resultId ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'UPDATE',
    module: 'results',
    details: `Entered result for ${updated.testName}: ${updated.value}`,
  });
  return updated;
}

export function approveResultLocal(id: string, approvedBy: string): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    approvalStatus: 'Approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
  };
  memoryResults = results.map((r) => (r.id === id ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'APPROVE',
    module: 'reports',
    details: `Approved result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}

export function rejectResultLocal(
  id: string,
  approvedBy: string,
  pathologistNotes?: string,
): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    approvalStatus: 'Rejected',
    pathologistNotes,
    approvedBy,
    approvedAt: new Date().toISOString(),
  };
  memoryResults = results.map((r) => (r.id === id ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'REJECT',
    module: 'reports',
    details: `Rejected result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}
