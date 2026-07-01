/**
 * Clears both master and transactional collections for LIMS and seeds them
 * with default master catalog data and realistic mock clinical data.
 *
 * Usage: npm run reseed-all
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APP_TEMPLATE_ID = 'lims';
const TABLES_COLLECTION = 'tables';
const RECORDS_COLLECTION = 'records';
const TEMPLATE_COLLECTION = 'templates';

const TRANSACTIONAL_TABLES = [
  'patients',
  'orders',
  'invoices',
  'samples',
  'results',
  'appointments',
];

const MASTER_TABLES = [
  'users',
  'roles',
  'branches',
  'departments',
  'tests',
  'packages',
  'sample_types',
];

const ALL_PERMISSION_IDS = [
  'dashboard.read', 'patients.read', 'patients.create', 'patients.update',
  'appointments.read', 'appointments.create', 'appointments.update',
  'tests.read', 'tests.create', 'tests.update',
  'orders.read', 'orders.create', 'orders.update',
  'billing.read', 'billing.create', 'billing.update',
  'samples.read', 'samples.create', 'samples.update',
  'results.read', 'results.create', 'results.update',
  'reports.read', 'reports.approve',
  'inventory.read', 'inventory.create', 'equipment.read', 'equipment.update',
  'analytics.read',
  'users.read', 'users.create', 'users.update', 'audit.read',
  'settings.read', 'settings.update',
];

const SEED_ROLES = [
  {
    id: 'role-admin',
    name: 'Admin',
    label: 'Admin',
    description: 'Full system access including roles, permissions, and lab settings.',
    permissions: ALL_PERMISSION_IDS,
    color: 'primary',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-receptionist',
    name: 'Receptionist',
    label: 'Receptionist',
    description: 'Front desk — patients, appointments, orders, billing, and sample registration.',
    permissions: [
      'dashboard.read', 'patients.read', 'patients.create', 'patients.update',
      'appointments.read', 'appointments.create', 'appointments.update',
      'tests.read', 'orders.read', 'orders.create', 'orders.update',
      'billing.read', 'billing.create', 'billing.update', 'samples.read',
    ],
    color: 'blue',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-lab-tech',
    name: 'Lab Technician',
    label: 'Lab Technician',
    description: 'Sample processing, result entry, and inventory visibility.',
    permissions: [
      'dashboard.read', 'patients.read', 'orders.read', 'samples.read', 'samples.create', 'samples.update',
      'results.read', 'results.create', 'results.update', 'inventory.read',
    ],
    color: 'emerald',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-pathologist',
    name: 'Pathologist',
    label: 'Pathologist',
    description: 'Result review, report approval, and analytics.',
    permissions: [
      'dashboard.read', 'patients.read', 'orders.read', 'samples.read',
      'results.read', 'reports.read', 'reports.approve', 'analytics.read',
    ],
    color: 'violet',
    status: 'Active',
    isSystem: true,
  },
];

const DEFAULT_BRANCH = {
  id: 'BR-MAIN',
  name: 'Main Branch',
  code: 'MAIN',
  isActive: true,
};

const SEED_DEPARTMENTS = [
  { id: 'DEPT-HEM', name: 'Hematology', code: 'HEM' },
  { id: 'DEPT-BIO', name: 'Biochemistry', code: 'BIO' },
  { id: 'DEPT-MIC', name: 'Microbiology', code: 'MIC' },
  { id: 'DEPT-SER', name: 'Serology', code: 'SER' },
  { id: 'DEPT-PAT', name: 'Pathology', code: 'PAT' },
];

const SEED_SAMPLE_TYPES = [
  { id: 'STYPE-BLD', name: 'Blood', code: 'BLD', isActive: true },
  { id: 'STYPE-URN', name: 'Urine', code: 'URN', isActive: true },
  { id: 'STYPE-SWB', name: 'Swab', code: 'SWB', isActive: true },
  { id: 'STYPE-OTH', name: 'Other', code: 'OTH', isActive: true },
];

const SEED_TESTS = [
  { id: 'TST-CBC', name: 'Complete Blood Count', departmentId: 'DEPT-HEM', departmentName: 'Hematology', price: 450, sampleType: 'Blood', turnaroundHours: 4, unit: 'cells/µL', referenceRange: '4.5–11.0', isActive: true },
  { id: 'TST-FBS', name: 'Fasting Blood Sugar', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 120, sampleType: 'Blood', turnaroundHours: 2, unit: 'mg/dL', referenceRange: '70–100', isActive: true },
  { id: 'TST-LFT', name: 'Liver Function Test', departmentId: 'DEPT-BIO', departmentName: 'Biochemistry', price: 850, sampleType: 'Blood', turnaroundHours: 6, isActive: true },
  { id: 'TST-TSH', name: 'Thyroid Profile (TSH)', departmentId: 'DEPT-SER', departmentName: 'Serology', price: 350, sampleType: 'Blood', turnaroundHours: 24, unit: 'mIU/L', referenceRange: '0.4–4.0', isActive: true },
];

const SEED_PACKAGES = [
  { id: 'PKG-BASIC', name: 'Basic Health Package', testIds: ['TST-CBC', 'TST-FBS'], price: 520, description: 'CBC + Fasting Blood Sugar' },
  { id: 'PKG-EXEC', name: 'Executive Health Package', testIds: ['TST-CBC', 'TST-LFT', 'TST-TSH'], price: 1450, description: 'Comprehensive metabolic panel' },
  { id: 'PKG-SENIOR', name: 'Senior Citizen Package', testIds: ['TST-CBC', 'TST-TSH', 'TST-FBS'], price: 890, description: 'CBC, thyroid, and fasting sugar' },
  { id: 'PKG-DIABETES', name: 'Diabetes Package', testIds: ['TST-FBS', 'TST-CBC'], price: 520, description: 'Fasting blood sugar and CBC' },
];

const INITIAL_ADMIN = {
  id: 'USR-ADMIN',
  email: 'labsystem2026@gmail.com',
  username: 'admin',
  displayName: 'Lab System Admin',
  mobile: '',
  department: 'Administration',
  role: 'Admin',
  branchId: 'BR-MAIN',
};

const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

const MOCK_PATIENTS = [
  {
    id: 'PAT-000001',
    branchId: 'BR-MAIN',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    phone: '9876543210',
    dateOfBirth: '1992-05-15',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    address: '123 Main St, Springfield',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Walk-In',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'PAT-000002',
    branchId: 'BR-MAIN',
    firstName: 'Sarah',
    lastName: 'Connor',
    name: 'Sarah Connor',
    phone: '9876543211',
    dateOfBirth: '1998-09-20',
    age: 27,
    gender: 'Female',
    bloodGroup: 'A+',
    address: '742 Evergreen Terrace, Springfield',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000003',
    branchId: 'BR-MAIN',
    firstName: 'Tony',
    lastName: 'Stark',
    name: 'Tony Stark',
    phone: '9876543212',
    dateOfBirth: '1981-04-11',
    age: 45,
    gender: 'Male',
    bloodGroup: 'AB+',
    address: '10880 Malibu Point, Malibu',
    referredDoctor: 'Dr. Nick Riviera',
    patientType: 'Corporate',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000004',
    branchId: 'BR-MAIN',
    firstName: 'Bruce',
    lastName: 'Wayne',
    name: 'Bruce Wayne',
    phone: '9876543213',
    dateOfBirth: '1988-02-19',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O-',
    address: '1007 Mountain Drive, Gotham',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Insurance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000005',
    branchId: 'BR-MAIN',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    phone: '9876543214',
    dateOfBirth: '2001-12-05',
    age: 24,
    gender: 'Female',
    bloodGroup: 'B+',
    address: '456 Oak Ave, Springfield',
    referredDoctor: 'Dr. Nick Riviera',
    patientType: 'Walk-In',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_ORDERS = [
  {
    id: 'ORD-2026-0001',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    testIds: ['TST-CBC', 'TST-TSH'],
    testNames: ['Complete Blood Count', 'Thyroid Profile (TSH)'],
    status: 'Completed',
    totalAmount: 800,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0002',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    testIds: ['TST-FBS'],
    testNames: ['Fasting Blood Sugar'],
    status: 'Processing',
    totalAmount: 120,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'Urgent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0003',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    testIds: ['TST-LFT'],
    testNames: ['Liver Function Test'],
    status: 'Pending',
    totalAmount: 850,
    gstPercent: 0,
    referringDoctor: 'Dr. Nick Riviera',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0004',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    testIds: ['TST-CBC', 'TST-LFT'],
    testNames: ['Complete Blood Count', 'Liver Function Test'],
    status: 'Pending',
    totalAmount: 1300,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'STAT',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ORD-2026-0005',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    testIds: ['TST-TSH'],
    testNames: ['Thyroid Profile (TSH)'],
    status: 'Completed',
    totalAmount: 350,
    gstPercent: 0,
    referringDoctor: 'Dr. Nick Riviera',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_INVOICES = [
  {
    id: 'INV-2026-0001',
    orderId: 'ORD-2026-0001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    amount: 800,
    paidAmount: 800,
    status: 'Paid',
    paymentMethod: 'Cash',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0002',
    orderId: 'ORD-2026-0002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    amount: 120,
    paidAmount: 0,
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0003',
    orderId: 'ORD-2026-0003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    amount: 850,
    paidAmount: 850,
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0004',
    orderId: 'ORD-2026-0004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    amount: 1300,
    paidAmount: 500,
    status: 'Partial',
    paymentMethod: 'UPI',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-2026-0005',
    orderId: 'ORD-2026-0005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    amount: 350,
    paidAmount: 350,
    status: 'Paid',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_SAMPLES = [
  {
    id: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    barcode: 'SMP-2026-0001',
    sampleType: 'Blood',
    status: 'Completed',
    collectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0002',
    orderId: 'ORD-2026-0002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    barcode: 'SMP-2026-0002',
    sampleType: 'Blood',
    status: 'Received',
    collectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0003',
    orderId: 'ORD-2026-0003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    barcode: 'SMP-2026-0003',
    sampleType: 'Blood',
    status: 'Registered',
    collectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0004',
    orderId: 'ORD-2026-0004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    barcode: 'SMP-2026-0004',
    sampleType: 'Blood',
    status: 'Registered',
    collectedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'SMP-2026-0005',
    orderId: 'ORD-2026-0005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    barcode: 'SMP-2026-0005',
    sampleType: 'Blood',
    status: 'Completed',
    collectedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 17.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_RESULTS = [
  {
    id: 'RES-2026-0001',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'TST-CBC',
    testName: 'Complete Blood Count',
    value: '14.5',
    unit: 'cells/µL',
    referenceRange: '4.5–11.0',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 22.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0002',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'TST-TSH',
    testName: 'Thyroid Profile (TSH)',
    value: '2.8',
    unit: 'mIU/L',
    referenceRange: '0.4–4.0',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 22.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0003',
    sampleId: 'SMP-2026-0002',
    orderId: 'ORD-2026-0002',
    testId: 'TST-FBS',
    testName: 'Fasting Blood Sugar',
    value: '110',
    unit: 'mg/dL',
    referenceRange: '70–100',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0004',
    sampleId: 'SMP-2026-0005',
    orderId: 'ORD-2026-0005',
    testId: 'TST-TSH',
    testName: 'Thyroid Profile (TSH)',
    value: '1.9',
    unit: 'mIU/L',
    referenceRange: '0.4–4.0',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 16.5 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_APPOINTMENTS = [
  {
    id: 'APT-001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'Walk-In',
    status: 'Completed',
    orderId: 'ORD-2026-0001',
    testIds: ['TST-CBC', 'TST-TSH'],
    testNames: ['Complete Blood Count', 'Thyroid Profile (TSH)'],
    orderTotal: 800,
  },
  {
    id: 'APT-002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Completed',
    orderId: 'ORD-2026-0002',
    testIds: ['TST-FBS'],
    testNames: ['Fasting Blood Sugar'],
    orderTotal: 120,
  },
  {
    id: 'APT-003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    scheduledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Completed',
    orderId: 'ORD-2026-0003',
    testIds: ['TST-LFT'],
    testNames: ['Liver Function Test'],
    orderTotal: 850,
  },
  {
    id: 'APT-004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Scheduled',
    orderId: 'ORD-2026-0004',
    testIds: ['TST-CBC', 'TST-LFT'],
    testNames: ['Complete Blood Count', 'Liver Function Test'],
    orderTotal: 1300,
  },
  {
    id: 'APT-005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    scheduledAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    type: 'Walk-In',
    status: 'Completed',
    orderId: 'ORD-2026-0005',
    testIds: ['TST-TSH'],
    testNames: ['Thyroid Profile (TSH)'],
    orderTotal: 350,
  }
];

function loadEnvLocal() {
  const envPath = resolve(root, '.env.local');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function appCollection(db, table) {
  return db
    .collection(TEMPLATE_COLLECTION)
    .doc(APP_TEMPLATE_ID)
    .collection(TABLES_COLLECTION)
    .doc(table)
    .collection(RECORDS_COLLECTION);
}

function initFirebase() {
  loadEnvLocal();
  const rel = process.env.FIREBASE_CREDENTIALS?.trim();
  if (!rel) throw new Error('FIREBASE_CREDENTIALS is not set in .env.local');
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();
  if (!password) throw new Error('ADMIN_SEED_PASSWORD is not set in .env.local');
  const credPath = isAbsolute(rel) ? rel : resolve(root, rel);
  const parsed = JSON.parse(readFileSync(credPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: parsed.project_id,
      privateKey: parsed.private_key,
      clientEmail: parsed.client_email,
    }),
  });
  return { db: admin.firestore(), password };
}

async function reseedAllCollections(db, password) {
  const allTables = [...TRANSACTIONAL_TABLES, ...MASTER_TABLES];

  console.log('Wiping existing LIMS collections...');
  for (const table of allTables) {
    const snap = await appCollection(db, table).get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`  Wiped ${snap.size} document(s) from ${table}`);
    }
  }

  console.log('\nSeeding default master data...');

  // Seed branch
  await appCollection(db, 'branches').doc(DEFAULT_BRANCH.id).set(DEFAULT_BRANCH);
  console.log('  Seeded 1 branch');

  // Seed roles
  for (const role of SEED_ROLES) {
    await appCollection(db, 'roles').doc(role.id).set(role);
  }
  console.log(`  Seeded ${SEED_ROLES.length} roles`);

  // Seed admin user
  const user = {
    id: INITIAL_ADMIN.id,
    displayName: INITIAL_ADMIN.displayName,
    email: INITIAL_ADMIN.email.toLowerCase(),
    username: INITIAL_ADMIN.username,
    mobile: INITIAL_ADMIN.mobile,
    department: INITIAL_ADMIN.department,
    passwordHash: hashPassword(password),
    role: INITIAL_ADMIN.role,
    branchId: INITIAL_ADMIN.branchId,
    status: 'Active',
    createdAt: new Date().toISOString(),
  };
  await appCollection(db, 'users').doc(user.id).set(user);
  console.log('  Seeded admin user');

  // Seed departments
  for (const dept of SEED_DEPARTMENTS) {
    await appCollection(db, 'departments').doc(dept.id).set(dept);
  }
  console.log(`  Seeded ${SEED_DEPARTMENTS.length} departments`);

  // Seed sample types
  for (const st of SEED_SAMPLE_TYPES) {
    await appCollection(db, 'sample_types').doc(st.id).set(st);
  }
  console.log(`  Seeded ${SEED_SAMPLE_TYPES.length} sample types`);

  // Seed tests
  for (const test of SEED_TESTS) {
    await appCollection(db, 'tests').doc(test.id).set(test);
  }
  console.log(`  Seeded ${SEED_TESTS.length} tests`);

  // Seed packages
  for (const pkg of SEED_PACKAGES) {
    await appCollection(db, 'packages').doc(pkg.id).set(pkg);
  }
  console.log(`  Seeded ${SEED_PACKAGES.length} packages`);

  console.log('\nSeeding mock transactional/clinical data...');

  // Patients
  for (const pat of MOCK_PATIENTS) {
    await appCollection(db, 'patients').doc(pat.id).set(pat);
  }
  console.log(`  Seeded ${MOCK_PATIENTS.length} patients`);

  // Orders
  for (const ord of MOCK_ORDERS) {
    await appCollection(db, 'orders').doc(ord.id).set(ord);
  }
  console.log(`  Seeded ${MOCK_ORDERS.length} orders`);

  // Invoices
  for (const inv of MOCK_INVOICES) {
    await appCollection(db, 'invoices').doc(inv.id).set(inv);
  }
  console.log(`  Seeded ${MOCK_INVOICES.length} invoices`);

  // Samples
  for (const smp of MOCK_SAMPLES) {
    await appCollection(db, 'samples').doc(smp.id).set(smp);
  }
  console.log(`  Seeded ${MOCK_SAMPLES.length} samples`);

  // Results
  for (const res of MOCK_RESULTS) {
    await appCollection(db, 'results').doc(res.id).set(res);
  }
  console.log(`  Seeded ${MOCK_RESULTS.length} test results`);

  // Appointments
  for (const apt of MOCK_APPOINTMENTS) {
    await appCollection(db, 'appointments').doc(apt.id).set(apt);
  }
  console.log(`  Seeded ${MOCK_APPOINTMENTS.length} appointments`);

  console.log('\nReseed completed successfully!');
}

try {
  const { db, password } = initFirebase();
  await reseedAllCollections(db, password);
} catch (e) {
  console.error('Error during reseed:', e);
  process.exit(1);
}
