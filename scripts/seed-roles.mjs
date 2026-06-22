/**
 * Seeds default roles into Firestore when the roles collection is empty.
 * Usage: npm run seed-roles
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APP_TEMPLATE_ID = 'lims';
const TABLES_COLLECTION = 'tables';
const RECORDS_COLLECTION = 'records';
const TEMPLATE_COLLECTION = 'templates';

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
  const credPath = isAbsolute(rel) ? rel : resolve(root, rel);
  const parsed = JSON.parse(readFileSync(credPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: parsed.project_id,
      privateKey: parsed.private_key,
      clientEmail: parsed.client_email,
    }),
  });
  return admin.firestore();
}

async function seedRolesIfEmpty(db) {
  const snap = await appCollection(db, 'roles').get();
  if (!snap.empty) {
    console.log(`Roles collection already has ${snap.size} document(s). Skipping seed.`);
    return;
  }
  for (const role of SEED_ROLES) {
    await appCollection(db, 'roles').doc(role.id).set(role);
  }
  console.log(`Seeded ${SEED_ROLES.length} default roles into Firestore.`);
}

const db = initFirebase();
await seedRolesIfEmpty(db);
