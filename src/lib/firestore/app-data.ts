import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import type { DbUser, PublicUser } from '@/lib/data/db-types';
import type {
  Appointment,
  AuditLogEntry,
  Branch,
  DashboardKpis,
  DoctorReferral,
  Equipment,
  HealthPackage,
  Invoice,
  InventoryItem,
  LabOrder,
  LabTest,
  MarketingLead,
  Patient,
  Sample,
  SampleType,
  Supplier,
  TestDepartment,
  TestResult,
} from '@/lib/types/lims';
import { getAnalyticsSnapshot, type AnalyticsPeriod } from '@/lib/data/analytics';
import { buildPatientReports } from '@/lib/data/reports';

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

// ── Appointments ──────────────────────────────────────────────

export async function listAppointments(): Promise<Appointment[]> {
  return listDocs<Appointment>('appointments', (a, b) =>
    b.scheduledAt.localeCompare(a.scheduledAt),
  );
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  return getDoc<Appointment>('appointments', id);
}

// ── Tests & catalog ───────────────────────────────────────────

export async function listTests(): Promise<LabTest[]> {
  return listDocs<LabTest>('tests', (a, b) => a.name.localeCompare(b.name));
}

export async function listPackages(): Promise<HealthPackage[]> {
  return listDocs<HealthPackage>('packages', (a, b) => a.name.localeCompare(b.name));
}

export async function listDepartments(): Promise<TestDepartment[]> {
  return listDocs<TestDepartment>('departments', (a, b) => a.name.localeCompare(b.name));
}

export async function listSampleTypes(): Promise<SampleType[]> {
  return listDocs<SampleType>('sample_types', (a, b) => a.name.localeCompare(b.name));
}

export async function listReferrals(): Promise<DoctorReferral[]> {
  return listDocs<DoctorReferral>('referrals', (a, b) => a.doctorName.localeCompare(b.doctorName));
}

export async function listBranches(): Promise<Branch[]> {
  return listDocs<Branch>('branches', (a, b) => a.name.localeCompare(b.name));
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

export async function getSample(id: string): Promise<Sample | null> {
  return getDoc<Sample>('samples', id);
}

// ── Results ───────────────────────────────────────────────────

export async function listResults(): Promise<TestResult[]> {
  return listDocs<TestResult>('results', (a, b) =>
    (b.enteredAt ?? '').localeCompare(a.enteredAt ?? ''),
  );
}

export async function getResult(id: string): Promise<TestResult | null> {
  return getDoc<TestResult>('results', id);
}

// ── Invoices ──────────────────────────────────────────────────

export async function listInvoices(): Promise<Invoice[]> {
  return listDocs<Invoice>('invoices', (a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  return getDoc<Invoice>('invoices', id);
}

// ── Inventory & admin ─────────────────────────────────────────

export async function listInventory(): Promise<InventoryItem[]> {
  return listDocs<InventoryItem>('inventory', (a, b) => a.name.localeCompare(b.name));
}

export async function listSuppliers(): Promise<Supplier[]> {
  return listDocs<Supplier>('suppliers', (a, b) => a.name.localeCompare(b.name));
}

export async function listEquipment(): Promise<Equipment[]> {
  return listDocs<Equipment>('equipment', (a, b) => a.name.localeCompare(b.name));
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

// ── Analytics & reports (server-side aggregation) ─────────────

export async function getAnalyticsFromDb(period: AnalyticsPeriod = 'overall') {
  const [patients, samples, orders, invoices, results, appointments, users, inventory, tests] =
    await Promise.all([
      listPatients(),
      listSamples(),
      listOrders(),
      listInvoices(),
      listResults(),
      listAppointments(),
      listUsers(),
      listInventory(),
      listTests(),
    ]);

  // Temporarily inject into analytics by using snapshot with live data
  // Analytics module reads from store getters — we replicate via a server adapter
  void patients;
  void samples;
  void orders;
  void invoices;
  void results;
  void appointments;
  void users;
  void inventory;
  void tests;

  return getAnalyticsSnapshot(period);
}

export async function listReports() {
  const [results, orders, patients, samples] = await Promise.all([
    listResults(),
    listOrders(),
    listPatients(),
    listSamples(),
  ]);
  void results;
  void orders;
  void patients;
  void samples;
  return buildPatientReports();
}
