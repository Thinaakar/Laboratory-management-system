import type { Supplier } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-suppliers-v1';

export const seedSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'MedSupply India Pvt Ltd', contact: '+91 98765 11111', email: 'orders@medsupply.in', gst: '27AABCM1234A1Z5', totalPurchases: 245000 },
  { id: 'SUP-002', name: 'LabChem Distributors', contact: '+91 98765 22222', email: 'sales@labchem.in', gst: '27AABCL5678B1Z3', totalPurchases: 89000 },
];

function cloneSeed(): Supplier[] {
  return seedSuppliers.map((s) => ({ ...s }));
}

function loadSuppliers(): Supplier[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Supplier[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveSuppliers(suppliers: Supplier[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

let memorySuppliers = cloneSeed();

export function getSuppliers(): Supplier[] {
  if (typeof window !== 'undefined') {
    memorySuppliers = loadSuppliers();
  }
  return memorySuppliers.map((s) => ({ ...s }));
}

export function addSupplier(input: {
  name: string;
  contact: string;
  email?: string;
  gst?: string;
}): Supplier {
  const suppliers = getSuppliers();
  const created: Supplier = {
    id: `SUP-${Date.now()}`,
    name: input.name.trim(),
    contact: input.contact.trim(),
    email: input.email?.trim() || undefined,
    gst: input.gst?.trim() || undefined,
    totalPurchases: 0,
  };
  memorySuppliers = [...suppliers, created];
  saveSuppliers(memorySuppliers);
  logAuditAction({
    action: 'CREATE',
    module: 'stocks',
    details: `Added supplier ${created.name}`,
  });
  return created;
}
