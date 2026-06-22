import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import { hashPassword } from '@/lib/auth/password-server';
import { DEMO_USERS, DEFAULT_BRANCH } from '@/lib/data/db-types';
import type { DbUser } from '@/lib/data/db-types';
import { isCollectionEmpty } from '@/lib/firestore/app-data';
import { seedDocument } from '@/lib/firestore/app-writes';
import { seedDepartments } from '@/lib/data/departments-store';
import { seedPackages } from '@/lib/data/packages-store';
import { seedSampleTypes } from '@/lib/data/sample-types-store';
import { seedTests } from '@/lib/data/tests-store';

/** Tables that hold real operational data — never auto-seeded with demo rows. */
export const TRANSACTIONAL_TABLES = [
  'patients',
  'orders',
  'invoices',
  'samples',
  'results',
  'appointments',
] as const;

/** Master catalog + auth — seeded once on empty database. */
export const MASTER_TABLES = [
  'users',
  'branches',
  'departments',
  'tests',
  'packages',
  'sample_types',
] as const;

async function seedUsers(): Promise<void> {
  for (const demo of DEMO_USERS) {
    const user: DbUser = {
      id: demo.id,
      displayName: demo.displayName,
      email: demo.email.toLowerCase(),
      passwordHash: hashPassword(demo.password),
      role: demo.role,
      branchId: DEFAULT_BRANCH.id,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    await seedDocument('users', user.id, user as unknown as Record<string, unknown>);
  }
}

async function runMasterSeed(): Promise<string> {
  await seedDocument('branches', DEFAULT_BRANCH.id, DEFAULT_BRANCH);
  await seedUsers();

  for (const dept of seedDepartments) {
    await seedDocument('departments', dept.id, dept as unknown as Record<string, unknown>);
  }
  for (const test of seedTests) {
    await seedDocument('tests', test.id, test as unknown as Record<string, unknown>);
  }
  for (const pkg of seedPackages) {
    await seedDocument('packages', pkg.id, pkg as unknown as Record<string, unknown>);
  }
  for (const sampleType of seedSampleTypes) {
    await seedDocument('sample_types', sampleType.id, sampleType as unknown as Record<string, unknown>);
  }

  return `Seeded master data: ${DEMO_USERS.length} users, ${seedTests.length} tests, ${seedPackages.length} packages.`;
}

export async function ensureSeeded(): Promise<{ seeded: boolean; message: string }> {
  const usersEmpty = await isCollectionEmpty('users');
  if (!usersEmpty) {
    return { seeded: false, message: 'Database already initialized.' };
  }
  const message = await runMasterSeed();
  return { seeded: true, message };
}

export async function clearTransactionalFirestore(): Promise<{ deleted: Record<string, number> }> {
  const db = getAdminFirestore();
  const deleted: Record<string, number> = {};

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

export async function forceReseed(): Promise<{ seeded: boolean; message: string }> {
  const db = getAdminFirestore();
  const allTables = [...TRANSACTIONAL_TABLES, ...MASTER_TABLES];

  for (const table of allTables) {
    const snap = await appCollection(db, table).get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  const message = await runMasterSeed();
  return { seeded: true, message: `Cleared all tables. ${message}` };
}
