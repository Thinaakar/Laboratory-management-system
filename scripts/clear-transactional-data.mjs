/**
 * Clears transactional rows from Firestore.
 * Usage: npm run clear-transactional
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

const TRANSACTIONAL_TABLES = [
  'patients',
  'orders',
  'invoices',
  'samples',
  'results',
  'appointments',
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

async function clearTransactionalFirestore(db) {
  const deleted = {};
  for (const table of TRANSACTIONAL_TABLES) {
    const snap = await appCollection(db, table).get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    deleted[table] = snap.size;
  }
  return { deleted };
}

function initFirebase() {
  loadEnvLocal();
  const rel = process.env.FIREBASE_CREDENTIALS?.trim();
  if (!rel) {
    throw new Error('FIREBASE_CREDENTIALS is not set in .env.local');
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
  return admin.firestore();
}

const db = initFirebase();
const result = await clearTransactionalFirestore(db);
console.log('Cleared transactional Firestore collections:');
for (const [table, count] of Object.entries(result.deleted)) {
  console.log(`  ${table}: ${count} document(s) deleted`);
}
