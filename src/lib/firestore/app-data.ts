import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import type { DbUser, PublicUser } from '@/lib/data/db-types';
import type {
  AuditLogEntry,
  DashboardKpis,
  Invoice,
  LabOrder,
  LabTest,
  MarketingLead,
  Patient,
  Sample,
  TestResult,
} from '@/lib/types/lims';

function db(): Firestore {
  return getAdminFirestore();
}

function docData<T extends { id: string }>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

async function listDocs<T extends { id: string }>(
  table: string,
  sort?: (a: T, b: T) => number,
): Promise<T[]> {
  const snap = await appCollection(db(), table).get();
  const items = snap.docs.map((d) => docData<T>(d.id, d.data() as Record<string, unknown>));
  return sort ? items.sort(sort) : items;
}

async function getDoc<T extends { id: string }>(table: string, id: string): Promise<T | null> {
  const doc = await appCollection(db(), table).doc(id).get();
  if (!doc.exists) return null;
  return docData<T>(doc.id, doc.data() as Record<string, unknown>);
}

export async function isCollectionEmpty(table: string): Promise<boolean> {
  const snap = await appCollection(db(), table).limit(1).get();
  return snap.empty;
}

export function toPublicUser(user: DbUser): PublicUser {
  const { passwordHash: _removed, ...rest } = user;
  return rest;
}

// ── Users ─────────────────────────────────────────────────────

export async function listUsers(): Promise<DbUser[]> {
  return listDocs<DbUser>('users', (a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getUserById(id: string): Promise<DbUser | null> {
  return getDoc<DbUser>('users', id);
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const snap = await appCollection(db(), 'users')
    .where('email', '==', email.trim().toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docData<DbUser>(doc.id, doc.data() as Record<string, unknown>);
}

// ── Patients ──────────────────────────────────────────────────

export async function listPatients(): Promise<Patient[]> {
  return listDocs<Patient>('patients', (a, b) => a.name.localeCompare(b.name));
}

export async function getPatient(id: string): Promise<Patient | null> {
  return getDoc<Patient>('patients', id);
}

// ── Tests ─────────────────────────────────────────────────────

export async function listTests(): Promise<LabTest[]> {
  return listDocs<LabTest>('tests', (a, b) => a.name.localeCompare(b.name));
}

// ── Orders ────────────────────────────────────────────────────

export async function listOrders(): Promise<LabOrder[]> {
  return listDocs<LabOrder>('orders', (a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<LabOrder | null> {
  return getDoc<LabOrder>('orders', id);
}

// ── Samples ───────────────────────────────────────────────────

export async function listSamples(): Promise<Sample[]> {
  return listDocs<Sample>('samples', (a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Results ───────────────────────────────────────────────────

export async function listResults(): Promise<TestResult[]> {
  return listDocs<TestResult>('results', (a, b) => (b.enteredAt ?? '').localeCompare(a.enteredAt ?? ''));
}

// ── Invoices ──────────────────────────────────────────────────

export async function listInvoices(): Promise<Invoice[]> {
  return listDocs<Invoice>('invoices', (a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Leads ─────────────────────────────────────────────────────

export async function listLeads(): Promise<MarketingLead[]> {
  return listDocs<MarketingLead>('leads', (a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Audit ─────────────────────────────────────────────────────

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  return listDocs<AuditLogEntry>('audit_logs', (a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── Dashboard KPIs ────────────────────────────────────────────

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7);

  const [patients, samples, results, invoices] = await Promise.all([
    listPatients(),
    listSamples(),
    listResults(),
    listInvoices(),
  ]);

  const revenueToday = invoices
    .filter((i) => i.createdAt.startsWith(today))
    .reduce((s, i) => s + i.paidAmount, 0);

  const monthlyRevenue = invoices
    .filter((i) => i.createdAt.startsWith(monthStart))
    .reduce((s, i) => s + i.paidAmount, 0);

  return {
    totalPatients: patients.length,
    todayRegistrations: patients.filter((p) => p.createdAt.startsWith(today)).length,
    todaySamples: samples.filter((s) => s.createdAt.startsWith(today)).length,
    pendingTests: results.filter((r) => r.approvalStatus === 'Pending').length,
    completedReports: results.filter((r) => r.approvalStatus === 'Approved').length,
    revenueToday,
    monthlyRevenue,
    outstandingPayments: invoices
      .filter((i) => i.status !== 'Paid')
      .reduce((s, i) => s + (i.amount - i.paidAmount), 0),
  };
}
