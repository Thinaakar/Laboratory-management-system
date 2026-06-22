import type { SessionPayload } from '@/lib/auth/session';
import type { z } from 'zod';
import type {
  Branch,
  DoctorReferral,
  Equipment,
  HealthPackage,
  InventoryItem,
  LabTest,
  SampleType,
  Supplier,
  TestDepartment,
} from '@/lib/types/lims';
import type {
  branchCreateSchema,
  departmentCreateSchema,
  equipmentCreateSchema,
  generalSettingsSchema,
  inventoryCreateSchema,
  packageCreateSchema,
  referralCreateSchema,
  sampleTypeCreateSchema,
  sampleTypeUpdateSchema,
  supplierCreateSchema,
  testCreateSchema,
} from '@/lib/validation/catalog';
import { writeAuditEntry } from '@/lib/firestore/app-writes';
import { deleteDoc, setDoc } from '@/lib/firestore/helpers';
import {
  getDepartment,
  getGeneralSettings,
  getSampleType,
  listDepartments,
  listSampleTypes,
  listTests,
} from '@/lib/firestore/app-data';

export interface LabGeneralSettings {
  id: string;
  laboratoryName: string;
  contactPhone: string;
  email: string;
  enableQrVerification: boolean;
  requirePathologistApproval: boolean;
  includeDigitalSignature: boolean;
  updatedAt: string;
}

export const DEFAULT_GENERAL_SETTINGS: LabGeneralSettings = {
  id: 'general',
  laboratoryName: 'LabCore Diagnostic Center',
  contactPhone: '+91 22 4000 1234',
  email: 'info@labcore.io',
  enableQrVerification: true,
  requirePathologistApproval: true,
  includeDigitalSignature: true,
  updatedAt: new Date().toISOString(),
};

async function getDepartmentOrThrow(id: string): Promise<TestDepartment> {
  const dept = await getDepartment(id);
  if (!dept) throw new Error('Selected department not found.');
  return dept;
}

export async function createDepartmentDb(
  input: z.infer<typeof departmentCreateSchema>,
  session: SessionPayload,
): Promise<TestDepartment> {
  const code = input.code.trim().toUpperCase();
  const existing = (await listDepartments()).find((d) => d.code.toUpperCase() === code);
  if (existing) throw new Error('A department with this code already exists.');
  const dept: TestDepartment = {
    id: `DEPT-${code}`,
    name: input.name.trim(),
    code,
  };
  await setDoc('departments', dept.id, dept as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Created department ${dept.name}` });
  return dept;
}

export async function createBranchDb(
  input: z.infer<typeof branchCreateSchema>,
  session: SessionPayload,
): Promise<Branch> {
  const code = input.code.trim().toUpperCase();
  const branch: Branch = {
    id: `BR-${code}`,
    name: input.name.trim(),
    code,
    address: input.address?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    isActive: input.isActive,
  };
  await setDoc('branches', branch.id, branch as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Created branch ${branch.name}` });
  return branch;
}

export async function createSampleTypeDb(
  input: z.infer<typeof sampleTypeCreateSchema>,
  session: SessionPayload,
): Promise<SampleType> {
  const code = input.code.trim().toUpperCase();
  const sampleType: SampleType = {
    id: `ST-${code}`,
    name: input.name.trim(),
    code,
    isActive: input.isActive,
  };
  await setDoc('sample_types', sampleType.id, sampleType as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Created sample type ${sampleType.name}` });
  return sampleType;
}

export async function updateSampleTypeDb(
  id: string,
  input: z.infer<typeof sampleTypeUpdateSchema>,
  session: SessionPayload,
): Promise<SampleType> {
  const existing = await getSampleType(id);
  if (!existing) throw new Error('Sample type not found.');

  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const all = await listSampleTypes();
  if (all.some((s) => s.id !== id && s.code.toUpperCase() === code)) {
    throw new Error('A sample type with this code already exists.');
  }
  if (all.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('A sample type with this name already exists.');
  }

  const updated: SampleType = {
    ...existing,
    name,
    code,
    isActive: input.isActive,
  };
  await setDoc('sample_types', id, updated as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'UPDATE',
    module: 'settings',
    details: `Updated sample type ${updated.name}`,
  });
  return updated;
}

export async function deleteSampleTypeDb(id: string, session: SessionPayload): Promise<void> {
  const existing = await getSampleType(id);
  if (!existing) throw new Error('Sample type not found.');

  const tests = await listTests();
  if (tests.some((t) => t.sampleType === existing.name)) {
    throw new Error('Cannot delete — this sample type is used by one or more tests.');
  }

  await deleteDoc('sample_types', id);
  await writeAuditEntry(session, {
    action: 'DELETE',
    module: 'settings',
    details: `Deleted sample type ${existing.name}`,
  });
}

export async function createTestDb(
  input: z.infer<typeof testCreateSchema>,
  session: SessionPayload,
): Promise<LabTest> {
  const department = await getDepartmentOrThrow(input.departmentId);
  const sampleTypes = await listSampleTypes();
  const sampleType = sampleTypes.find((s) => s.name === input.sampleType && s.isActive);
  if (!sampleType) throw new Error('Selected sample type not found or inactive.');
  const id = `TST-${Date.now()}`;
  const test: LabTest = {
    id,
    name: input.name.trim(),
    departmentId: department.id,
    departmentName: department.name,
    price: input.price,
    sampleType: sampleType.name,
    turnaroundHours: input.turnaroundHours,
    unit: input.unit?.trim() || undefined,
    referenceRange: input.referenceRange?.trim() || undefined,
    isActive: input.isActive,
  };
  await setDoc('tests', id, test as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Created test ${test.name} (${test.id})` });
  return test;
}

export async function createPackageDb(
  input: z.infer<typeof packageCreateSchema>,
  session: SessionPayload,
): Promise<HealthPackage> {
  const id = `PKG-${Date.now()}`;
  const pkg: HealthPackage = {
    id,
    name: input.name.trim(),
    testIds: [...input.testIds],
    price: input.price,
    description: input.description?.trim() || undefined,
  };
  await setDoc('packages', id, pkg as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Created package ${pkg.name} (${pkg.id})` });
  return pkg;
}

export async function createReferralDb(
  input: z.infer<typeof referralCreateSchema>,
  session: SessionPayload,
): Promise<DoctorReferral> {
  const id = `REF-${Date.now()}`;
  const referral: DoctorReferral = {
    id,
    doctorName: input.doctorName.trim(),
    specialty: input.specialty?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    referralCount: 0,
    revenueGenerated: 0,
  };
  await setDoc('referrals', id, referral as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'settings', details: `Added referring doctor ${referral.doctorName}` });
  return referral;
}

export async function createInventoryDb(
  input: z.infer<typeof inventoryCreateSchema>,
  session: SessionPayload,
): Promise<InventoryItem> {
  const id = `INV-${Date.now()}`;
  const item: InventoryItem = {
    id,
    name: input.name.trim(),
    category: input.category,
    quantity: input.quantity,
    unit: input.unit.trim(),
    reorderLevel: input.reorderLevel,
    expiryDate: input.expiryDate || undefined,
    supplierId: input.supplierId || undefined,
  };
  await setDoc('inventory', id, item as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'stocks', details: `Added inventory item ${item.name} (${item.id})` });
  return item;
}

export async function createSupplierDb(
  input: z.infer<typeof supplierCreateSchema>,
  session: SessionPayload,
): Promise<Supplier> {
  const id = `SUP-${Date.now()}`;
  const supplier: Supplier = {
    id,
    name: input.name.trim(),
    contact: input.contact.trim(),
    email: input.email?.trim() || undefined,
    gst: input.gst?.trim() || undefined,
    totalPurchases: 0,
  };
  await setDoc('suppliers', id, supplier as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'stocks', details: `Added supplier ${supplier.name}` });
  return supplier;
}

export async function createEquipmentDb(
  input: z.infer<typeof equipmentCreateSchema>,
  session: SessionPayload,
): Promise<Equipment> {
  const id = `EQ-${Date.now()}`;
  const equipment: Equipment = {
    id,
    name: input.name.trim(),
    model: input.model?.trim() || undefined,
    serialNumber: input.serialNumber?.trim() || undefined,
    lastCalibration: input.lastCalibration || undefined,
    nextCalibrationDue: input.nextCalibrationDue || undefined,
    status: input.status,
  };
  await setDoc('equipment', id, equipment as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'CREATE', module: 'stocks', details: `Added equipment ${equipment.name} (${equipment.id})` });
  return equipment;
}

export async function saveGeneralSettingsDb(
  input: z.infer<typeof generalSettingsSchema>,
  session: SessionPayload,
): Promise<LabGeneralSettings> {
  const settings: LabGeneralSettings = {
    id: 'general',
    laboratoryName: input.laboratoryName.trim(),
    contactPhone: input.contactPhone.trim(),
    email: input.email.trim(),
    enableQrVerification: input.enableQrVerification,
    requirePathologistApproval: input.requirePathologistApproval,
    includeDigitalSignature: input.includeDigitalSignature,
    updatedAt: new Date().toISOString(),
  };
  await setDoc('lab_settings', settings.id, settings as unknown as Record<string, unknown>);
  await writeAuditEntry(session, { action: 'UPDATE', module: 'settings', details: 'Updated general lab settings' });
  return settings;
}

export async function deleteCatalogItemDb(
  table: string,
  id: string,
  session: SessionPayload,
  module: string,
  label: string,
): Promise<void> {
  await deleteDoc(table, id);
  await writeAuditEntry(session, { action: 'DELETE', module, details: `Deleted ${label} (${id})` });
}
