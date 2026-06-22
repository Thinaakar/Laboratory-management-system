import type { Firestore } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import type { DbUser, DbRole, PublicUser } from '@/lib/data/db-types';
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
  LimsUser,
  MarketingLead,
  Patient,
  Sample,
  SampleType,
  Supplier,
  TestDepartment,
  TestResult,
} from '@/lib/types/lims';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import { buildAnalyticsSnapshot, type AnalyticsPeriod } from '@/lib/data/analytics';
import { buildPatientReportsFromData } from '@/lib/data/reports';
import type { LabGeneralSettings } from '@/lib/firestore/catalog-writes';
import { DEFAULT_GENERAL_SETTINGS } from '@/lib/firestore/catalog-writes';

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
  return {
    ...rest,
    mobile: rest.mobile ?? '',
    username: rest.username ?? rest.email.split('@')[0] ?? '',
    department: rest.department ?? 'Administration',
  };
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

export async function getUserByUsername(username: string): Promise<DbUser | null> {
  const normalized = username.trim().toLowerCase();
  const snap = await appCollection(db(), 'users')
    .where('username', '==', normalized)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docData<DbUser>(doc.id, doc.data() as Record<string, unknown>);
}

/** Resolve login by email address or username. */
export async function getUserByLogin(identifier: string): Promise<DbUser | null> {
  const trimmed = identifier.trim();
  if (trimmed.includes('@')) {
    return getUserByEmail(trimmed);
  }
  return getUserByUsername(trimmed);
}

// ── Roles ─────────────────────────────────────────────────────

export async function listRoles(): Promise<DbRole[]> {
  return listDocs<DbRole>('roles', (a, b) => a.label.localeCompare(b.label));
}

export async function getRoleById(id: string): Promise<DbRole | null> {
  return getDoc<DbRole>('roles', id);
}

export async function getRoleByName(name: string): Promise<DbRole | null> {
  const normalized = name.trim();
  const roles = await listRoles();
  return roles.find((r) => r.name === normalized || r.label === normalized) ?? null;
}

export async function resolveRolePermissions(roleName: string): Promise<string[]> {
  const role = await getRoleByName(roleName);
  if (role) return role.permissions;
  return DEFAULT_ROLE_PERMISSIONS[roleName] ?? [];
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

export async function getSampleType(id: string): Promise<SampleType | null> {
  return getDoc<SampleType>('sample_types', id);
}

export async function listReferrals(): Promise<DoctorReferral[]> {
  return listDocs<DoctorReferral>('referrals', (a, b) => a.doctorName.localeCompare(b.doctorName));
}

export async function listBranches(): Promise<Branch[]> {
  return listDocs<Branch>('branches', (a, b) => a.name.localeCompare(b.name));
}

export async function getDepartment(id: string): Promise<TestDepartment | null> {
  return getDoc<TestDepartment>('departments', id);
}

export async function getGeneralSettings(): Promise<LabGeneralSettings | null> {
  const doc = await getDoc<LabGeneralSettings>('lab_settings', 'general');
  return doc;
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

  return buildAnalyticsSnapshot(
    {
      patients,
      samples,
      orders,
      invoices,
      results,
      appointments,
      users: users.map(
        (u): LimsUser => ({
          id: u.id,
          displayName: u.displayName,
          email: u.email,
          mobile: u.mobile ?? '',
          username: u.username ?? '',
          role: u.role as LimsUser['role'],
          department: u.department ?? 'Administration',
          status: u.status,
          branchId: u.branchId,
          createdAt: u.createdAt,
        }),
      ),
      inventory,
      tests,
    },
    period,
  );
}

export async function getGeneralSettingsOrDefault(): Promise<LabGeneralSettings> {
  const settings = await getGeneralSettings();
  return settings ?? DEFAULT_GENERAL_SETTINGS;
}

export async function listReports() {
  const [results, orders, patients, samples] = await Promise.all([
    listResults(),
    listOrders(),
    listPatients(),
    listSamples(),
  ]);

  return buildPatientReportsFromData({ results, orders, patients, samples });
}
