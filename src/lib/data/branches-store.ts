import type { Branch } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-branches-v1';

export const seedBranches: Branch[] = [
  { id: 'BR-MAIN', name: 'Main Laboratory', code: 'MAIN', address: '123 Health Park, Mumbai', phone: '+91 22 4000 1234', isActive: true },
];

function cloneSeed(): Branch[] {
  return seedBranches.map((b) => ({ ...b }));
}

function loadBranches(): Branch[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Branch[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveBranches(branches: Branch[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}

let memoryBranches = cloneSeed();

export function getBranches(): Branch[] {
  if (typeof window !== 'undefined') {
    memoryBranches = loadBranches();
  }
  return memoryBranches.map((b) => ({ ...b }));
}

export function addBranch(input: {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}): Branch {
  const branches = getBranches();
  const code = input.code.trim().toUpperCase();
  if (branches.some((b) => b.code.toUpperCase() === code)) {
    throw new Error('A branch with this code already exists.');
  }
  const created: Branch = {
    id: `BR-${code}`,
    name: input.name.trim(),
    code,
    address: input.address?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    isActive: input.isActive,
  };
  memoryBranches = [...branches, created];
  saveBranches(memoryBranches);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Created branch ${created.name} (${created.code})`,
  });
  return created;
}
