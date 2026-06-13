import type { LabTest } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';
import { getDepartments } from './departments-store';
import { getActiveSampleTypes } from './sample-types-store';

const STORAGE_KEY = 'labcore-tests-v1';

export const seedTests: LabTest[] = [
  { id: 'TST-CBC', name: 'Complete Blood Count', departmentId: 'DEPT-HEM', departmentName: 'Hematology', price: 450, sampleType: 'Blood', turnaroundHours: 4, unit: 'cells/µL', referenceRange: '4.5–11.0', isActive: true },
  { id: 'TST-FBS', name: 'Fasting Blood Sugar', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 120, sampleType: 'Blood', turnaroundHours: 2, unit: 'mg/dL', referenceRange: '70–100', isActive: true },
  { id: 'TST-LFT', name: 'Liver Function Test', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 850, sampleType: 'Blood', turnaroundHours: 6, isActive: true },
  { id: 'TST-TSH', name: 'Thyroid Profile (TSH)', departmentId: 'DEPT-SER', departmentName: 'Serology', price: 350, sampleType: 'Blood', turnaroundHours: 24, unit: 'mIU/L', referenceRange: '0.4–4.0', isActive: true },
];

function cloneSeed(): LabTest[] {
  return seedTests.map((t) => ({ ...t }));
}

function loadTests(): LabTest[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as LabTest[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveTests(tests: LabTest[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

let memoryTests = cloneSeed();

export function getTests(): LabTest[] {
  if (typeof window !== 'undefined') {
    memoryTests = loadTests();
  }
  return memoryTests.map((t) => ({ ...t }));
}

export function addTest(input: {
  name: string;
  departmentId: string;
  sampleType: string;
  price: number;
  turnaroundHours: number;
  unit?: string;
  referenceRange?: string;
  isActive: boolean;
}): LabTest {
  const tests = getTests();
  const department = getDepartments().find((d) => d.id === input.departmentId);
  if (!department) {
    throw new Error('Selected department not found.');
  }
  const sampleType = getActiveSampleTypes().find((s) => s.name === input.sampleType);
  if (!sampleType) {
    throw new Error('Selected sample type not found or inactive.');
  }
  const created: LabTest = {
    id: `TST-${Date.now()}`,
    name: input.name.trim(),
    departmentId: input.departmentId,
    departmentName: department.name,
    price: input.price,
    sampleType: sampleType.name,
    turnaroundHours: input.turnaroundHours,
    unit: input.unit?.trim() || undefined,
    referenceRange: input.referenceRange?.trim() || undefined,
    isActive: input.isActive,
  };
  memoryTests = [...tests, created];
  saveTests(memoryTests);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Created test ${created.name} (${created.id})`,
  });
  return created;
}
