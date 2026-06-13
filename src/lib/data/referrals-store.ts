import type { DoctorReferral } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-referrals-v1';

export const seedReferrals: DoctorReferral[] = [
  { id: 'REF-001', doctorName: 'Dr. Anil Kapoor', specialty: 'General Physician', phone: '+91 98765 33333', referralCount: 48, revenueGenerated: 125000 },
  { id: 'REF-002', doctorName: 'Dr. Sunita Rao', specialty: 'Endocrinologist', phone: '+91 98765 44444', referralCount: 22, revenueGenerated: 78000 },
];

function cloneSeed(): DoctorReferral[] {
  return seedReferrals.map((r) => ({ ...r }));
}

function loadReferrals(): DoctorReferral[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as DoctorReferral[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveReferrals(referrals: DoctorReferral[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(referrals));
}

let memoryReferrals = cloneSeed();

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
