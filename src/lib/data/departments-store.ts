import type { TestDepartment } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-departments-v1';

export const seedDepartments: TestDepartment[] = [
  { id: 'DEPT-HEM', name: 'Hematology', code: 'HEM' },
  { id: 'DEPT-BIO', name: 'Biochemistry', code: 'BIO' },
  { id: 'DEPT-MIC', name: 'Microbiology', code: 'MIC' },
  { id: 'DEPT-SER', name: 'Serology', code: 'SER' },
  { id: 'DEPT-PAT', name: 'Pathology', code: 'PAT' },
];

function cloneSeed(): TestDepartment[] {
  return seedDepartments.map((d) => ({ ...d }));
}

function loadDepartments(): TestDepartment[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as TestDepartment[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveDepartments(departments: TestDepartment[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
}

let memoryDepartments = cloneSeed();

export function getDepartments(): TestDepartment[] {
  if (typeof window !== 'undefined') {
    memoryDepartments = loadDepartments();
  }
  return memoryDepartments.map((d) => ({ ...d }));
}

export function addDepartment(input: { name: string; code: string }): TestDepartment {
  const departments = getDepartments();
  const code = input.code.trim().toUpperCase();
  if (departments.some((d) => d.code.toUpperCase() === code)) {
    throw new Error('A department with this code already exists.');
  }
  const created: TestDepartment = {
    id: `DEPT-${code}`,
    name: input.name.trim(),
    code,
  };
  memoryDepartments = [...departments, created];
  saveDepartments(memoryDepartments);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Created department ${created.name} (${created.code})`,
  });
  return created;
}
