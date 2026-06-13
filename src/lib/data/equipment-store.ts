import type { Equipment } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-equipment-v1';

export const EQUIPMENT_STATUS_OPTIONS: Equipment['status'][] = [
  'Active',
  'Maintenance',
  'Retired',
];

export const seedEquipment: Equipment[] = [
  { id: 'EQ-CBC', name: 'CBC Analyzer', model: 'Sysmex XN-1000', serialNumber: 'SN-CBC-001', lastCalibration: '2026-03-01', nextCalibrationDue: '2026-06-01', status: 'Active' },
  { id: 'EQ-BIO', name: 'Biochemistry Analyzer', model: 'Cobas c311', serialNumber: 'SN-BIO-002', lastCalibration: '2026-02-15', nextCalibrationDue: '2026-05-15', status: 'Active' },
  { id: 'EQ-CEN', name: 'Centrifuge', model: 'Hettich EBA 280', serialNumber: 'SN-CEN-003', lastCalibration: '2026-01-10', nextCalibrationDue: '2026-04-10', status: 'Maintenance' },
];

function cloneSeed(): Equipment[] {
  return seedEquipment.map((e) => ({ ...e }));
}

function loadEquipment(): Equipment[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Equipment[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveEquipment(equipment: Equipment[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(equipment));
}

let memoryEquipment = cloneSeed();

export function getEquipment(): Equipment[] {
  if (typeof window !== 'undefined') {
    memoryEquipment = loadEquipment();
  }
  return memoryEquipment.map((e) => ({ ...e }));
}

export function addEquipment(input: {
  name: string;
  model?: string;
  serialNumber?: string;
  lastCalibration?: string;
  nextCalibrationDue?: string;
  status: Equipment['status'];
}): Equipment {
  const equipment = getEquipment();
  const created: Equipment = {
    id: `EQ-${Date.now()}`,
    name: input.name.trim(),
    model: input.model?.trim() || undefined,
    serialNumber: input.serialNumber?.trim() || undefined,
    lastCalibration: input.lastCalibration || undefined,
    nextCalibrationDue: input.nextCalibrationDue || undefined,
    status: input.status,
  };
  memoryEquipment = [...equipment, created];
  saveEquipment(memoryEquipment);
  logAuditAction({
    action: 'CREATE',
    module: 'stocks',
    details: `Added equipment ${created.name} (${created.id})`,
  });
  return created;
}
