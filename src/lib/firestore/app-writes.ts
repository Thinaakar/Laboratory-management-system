import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import { listPatients } from '@/lib/firestore/app-data';
import type { MarketingLead, Patient } from '@/lib/types/lims';
import type { z } from 'zod';
import type { leadCreateSchema, patientCreateSchema } from '@/lib/validation/entities';

function col(name: string) {
  return appCollection(getAdminFirestore(), name);
}

function withoutUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as T;
}

function nextSequentialId(prefix: string, existing: { id: string }[], pad = 6): string {
  const nums = existing
    .map((r) => r.id.match(new RegExp(`^${prefix}-(\\d+)$`)))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(pad, '0')}`;
}

async function nextPatientId(): Promise<string> {
  return nextSequentialId('PAT', await listPatients());
}

async function nextLeadId(): Promise<string> {
  const snap = await col('leads').get();
  const existing = snap.docs.map((d) => ({ id: d.id }));
  return nextSequentialId('LEAD', existing, 4);
}

export async function seedDocument(table: string, id: string, data: Record<string, unknown>) {
  await col(table).doc(id).set(withoutUndefined({ ...data, updatedAt: FieldValue.serverTimestamp() }), { merge: true });
}

export async function createPatient(input: z.infer<typeof patientCreateSchema>): Promise<Patient> {
  const id = await nextPatientId();
  const name = input.name.trim();
  const [firstName, ...rest] = name.split(/\s+/);
  const patient: Patient = {
    id,
    firstName: firstName || name,
    lastName: rest.length ? rest.join(' ') : undefined,
    name,
    phone: input.phone.trim(),
    bloodGroup: input.bloodGroup,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    address: input.address?.trim(),
    branchId: input.branchId,
    createdAt: new Date().toISOString(),
  };
  await col('patients').doc(id).set(withoutUndefined(patient as unknown as Record<string, unknown>));
  return patient;
}

export async function createLead(input: z.infer<typeof leadCreateSchema>): Promise<MarketingLead> {
  const id = await nextLeadId();
  const lead: MarketingLead = {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim(),
    organization: input.organization?.trim(),
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  await col('leads').doc(id).set(withoutUndefined(lead as unknown as Record<string, unknown>));
  return lead;
}

export async function writeAuditLog(entry: {
  userId: string;
  userName: string;
  action: string;
  module: string;
  ipAddress?: string;
  details?: string;
}) {
  const id = `AUD-${Date.now()}`;
  await col('audit_logs').doc(id).set({
    ...entry,
    timestamp: new Date().toISOString(),
  });
}
