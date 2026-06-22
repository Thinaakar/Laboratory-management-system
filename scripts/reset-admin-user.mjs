/**
 * Replaces all Firestore users with the single INITIAL_ADMIN account.
 * Password is read from ADMIN_SEED_PASSWORD in .env.local (PBKDF2 hashed).
 *
 * Usage: npm run reset-admin
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
  if (!rel) {
    throw new Error('FIREBASE_CREDENTIALS is not set in .env.local');
  }
  const password = process.env.ADMIN_SEED_PASSWORD?.trim();
  if (!password) {
    throw new Error('ADMIN_SEED_PASSWORD is not set in .env.local');
  }
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

async function replaceUsersWithInitialAdmin(db, password) {
  const snap = await appCollection(db, 'users').get();
  if (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

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
  return { deleted: snap.size, email: user.email };
}

const { db, password } = initFirebase();
const result = await replaceUsersWithInitialAdmin(db, password);
console.log(`Deleted ${result.deleted} existing user(s).`);
console.log(`Created admin: ${result.email} (password hashed in Firestore).`);
