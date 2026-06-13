import type { SampleType } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';

const STORAGE_KEY = 'labcore-sample-types-v1';

export const seedSampleTypes: SampleType[] = [
  { id: 'STYPE-BLD', name: 'Blood', code: 'BLD', isActive: true },
  { id: 'STYPE-URN', name: 'Urine', code: 'URN', isActive: true },
  { id: 'STYPE-SWB', name: 'Swab', code: 'SWB', isActive: true },
  { id: 'STYPE-OTH', name: 'Other', code: 'OTH', isActive: true },
];

function cloneSeed(): SampleType[] {
  return seedSampleTypes.map((s) => ({ ...s }));
}

function loadSampleTypes(): SampleType[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as SampleType[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveSampleTypes(sampleTypes: SampleType[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTypes));
}

let memorySampleTypes = cloneSeed();

export function getSampleTypes(): SampleType[] {
  if (typeof window !== 'undefined') {
    memorySampleTypes = loadSampleTypes();
  }
  return memorySampleTypes.map((s) => ({ ...s }));
}

export function getActiveSampleTypes(): SampleType[] {
  return getSampleTypes().filter((s) => s.isActive);
}

export function addSampleType(input: {
  name: string;
  code: string;
  isActive?: boolean;
}): SampleType {
  const sampleTypes = getSampleTypes();
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (sampleTypes.some((s) => s.code.toUpperCase() === code)) {
    throw new Error('A sample type with this code already exists.');
  }
  if (sampleTypes.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A sample type with this name already exists.');
  }
  const created: SampleType = {
    id: `STYPE-${code}`,
    name,
    code,
    isActive: input.isActive ?? true,
  };
  memorySampleTypes = [...sampleTypes, created];
  saveSampleTypes(memorySampleTypes);
  logAuditAction({
    action: 'CREATE',
    module: 'settings',
    details: `Created sample type ${created.name} (${created.code})`,
  });
  return created;
}

export function updateSampleType(
  id: string,
  input: { name: string; code: string; isActive: boolean },
): SampleType {
  const sampleTypes = getSampleTypes();
  const index = sampleTypes.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Sample type not found.');

  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (sampleTypes.some((s) => s.id !== id && s.code.toUpperCase() === code)) {
    throw new Error('A sample type with this code already exists.');
  }
  if (sampleTypes.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A sample type with this name already exists.');
  }

  const updated: SampleType = {
    ...sampleTypes[index],
    name,
    code,
    isActive: input.isActive,
  };
  memorySampleTypes = sampleTypes.map((s) => (s.id === id ? updated : s));
  saveSampleTypes(memorySampleTypes);
  logAuditAction({
    action: 'UPDATE',
    module: 'settings',
    details: `Updated sample type ${updated.name} (${updated.code})`,
  });
  return updated;
}

export function deleteSampleType(id: string, isUsedByTest: (name: string) => boolean): void {
  const sampleTypes = getSampleTypes();
  const sampleType = sampleTypes.find((s) => s.id === id);
  if (!sampleType) throw new Error('Sample type not found.');
  if (isUsedByTest(sampleType.name)) {
    throw new Error('Cannot delete: tests are assigned to this sample type.');
  }
  memorySampleTypes = sampleTypes.filter((s) => s.id !== id);
  saveSampleTypes(memorySampleTypes);
  logAuditAction({
    action: 'DELETE',
    module: 'settings',
    details: `Deleted sample type ${sampleType.name} (${sampleType.code})`,
  });
}
