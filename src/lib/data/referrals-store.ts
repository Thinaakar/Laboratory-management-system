import type { DoctorReferral } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';
import { loadFromStorage, saveToStorage } from './storage-utils';

const STORAGE_KEY = 'labcore-referrals-v1';

export const seedReferrals: DoctorReferral[] = [];

function loadReferrals(): DoctorReferral[] {
  return loadFromStorage<DoctorReferral>(STORAGE_KEY, []);
}

function saveReferrals(referrals: DoctorReferral[]) {
  saveToStorage(STORAGE_KEY, referrals);
}

let memoryReferrals: DoctorReferral[] = [];

export function getReferrals(): DoctorReferral[] {
  if (typeof window !== 'undefined') {
    memoryReferrals = loadReferrals();
  }
  return memoryReferrals.map((r) => ({ ...r }));
}

export function addReferral(input: {
  doctorName: string;
  specialty?: string;
  phone?: string;
}): DoctorReferral {
  const referrals = getReferrals();
  const created: DoctorReferral = {
    id: `REF-${Date.now()}`,
    doctorName: input.doctorName.trim(),
    specialty: input.specialty?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    referralCount: 0,
    revenueGenerated: 0,
  };
  memoryReferrals = [...referrals, created];
  saveReferrals(memoryReferrals);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Added referring doctor ${created.doctorName}`,
  });
  return created;
}
