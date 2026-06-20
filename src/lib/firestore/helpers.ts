import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';

export function col(name: string) {
  return appCollection(getAdminFirestore(), name);
}

export function withoutUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as T;
}

export async function nextSequentialId(
  table: string,
  prefix: string,
  pad = 6,
  pattern?: RegExp,
): Promise<string> {
  const snap = await col(table).get();
  const re = pattern ?? new RegExp(`^${prefix}-(\\d+)$`);
  const nums = snap.docs
    .map((d) => d.id.match(re))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(pad, '0')}`;
}

export async function nextOrderId(): Promise<string> {
  const snap = await col('orders').get();
  const nums = snap.docs
    .map((d) => d.id.match(/^ORD-2026-(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ORD-2026-${String(next).padStart(4, '0')}`;
}

export async function nextInvoiceId(): Promise<string> {
  const snap = await col('invoices').get();
  const nums = snap.docs
    .map((d) => d.id.match(/^INV-2026-(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-2026-${String(next).padStart(4, '0')}`;
}

export async function nextSampleId(): Promise<string> {
  const snap = await col('samples').get();
  const nums = snap.docs
    .map((d) => d.id.match(/^SMP-2026-(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `SMP-2026-${String(next).padStart(4, '0')}`;
}

export async function nextBarcode(): Promise<string> {
  const snap = await col('samples').get();
  const nums = snap.docs
    .map((d) => (d.data().barcode as string | undefined)?.match(/^BC2026(\d+)$/))
    .filter(Boolean)
    .map((m) => parseInt(m![1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `BC2026${String(next).padStart(4, '0')}`;
}

export async function nextAppointmentId(): Promise<string> {
  return nextSequentialId('appointments', 'APT', 3, /^APT-(\d+)$/);
}

export async function nextResultId(): Promise<string> {
  return nextSequentialId('results', 'RES', 3, /^RES-(\d+)$/);
}

export async function setDoc(table: string, id: string, data: Record<string, unknown>) {
  await col(table).doc(id).set(
    withoutUndefined({ ...data, updatedAt: FieldValue.serverTimestamp() }),
    { merge: true },
  );
}

export async function deleteDoc(table: string, id: string) {
  await col(table).doc(id).delete();
}
