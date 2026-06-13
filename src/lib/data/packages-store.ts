import type { HealthPackage } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-packages-v1';

export const seedPackages: HealthPackage[] = [
  { id: 'PKG-BASIC', name: 'Basic Health Package', testIds: ['TST-CBC', 'TST-FBS'], price: 520, description: 'CBC + Fasting Blood Sugar' },
  { id: 'PKG-EXEC', name: 'Executive Health Package', testIds: ['TST-CBC', 'TST-LFT', 'TST-TSH'], price: 1450, description: 'Comprehensive metabolic panel' },
  { id: 'PKG-SENIOR', name: 'Senior Citizen Package', testIds: ['TST-CBC', 'TST-TSH', 'TST-FBS'], price: 890, description: 'CBC, thyroid, and fasting sugar' },
  { id: 'PKG-DIABETES', name: 'Diabetes Package', testIds: ['TST-FBS', 'TST-CBC'], price: 520, description: 'Fasting blood sugar and CBC' },
];

function cloneSeed(): HealthPackage[] {
  return seedPackages.map((p) => ({ ...p, testIds: [...p.testIds] }));
}

function loadPackages(): HealthPackage[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as HealthPackage[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function savePackages(packages: HealthPackage[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(packages));
}

let memoryPackages = cloneSeed();

export function getPackages(): HealthPackage[] {
  if (typeof window !== 'undefined') {
    memoryPackages = loadPackages();
  }
  return memoryPackages.map((p) => ({ ...p, testIds: [...p.testIds] }));
}

export function addPackage(input: {
  name: string;
  testIds: string[];
  price: number;
  description?: string;
}): HealthPackage {
  if (!input.testIds.length) {
    throw new Error('Select at least one test for the package.');
  }
  const packages = getPackages();
  const created: HealthPackage = {
    id: `PKG-${Date.now()}`,
    name: input.name.trim(),
    testIds: [...input.testIds],
    price: input.price,
    description: input.description?.trim() || undefined,
  };
  memoryPackages = [...packages, created];
  savePackages(memoryPackages);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Created package ${created.name} (${created.id})`,
  });
  return created;
}
