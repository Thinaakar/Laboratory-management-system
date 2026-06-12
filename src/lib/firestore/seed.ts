import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection } from '@/lib/firebase/collections';
import { hashPassword } from '@/lib/auth/password-server';
import { DEMO_USERS, DEFAULT_BRANCH } from '@/lib/data/db-types';
import type { DbUser } from '@/lib/data/db-types';
import { isCollectionEmpty } from '@/lib/firestore/app-data';
import { seedDocument } from '@/lib/firestore/app-writes';
import {
  seedDepartments,
  seedInvoices,
  seedOrders,
  seedPatients,
  seedResults,
  seedSamples,
  seedTests,
} from '@/lib/data/store';

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

async function runSeed(): Promise<string> {
  await seedDocument('branches', DEFAULT_BRANCH.id, DEFAULT_BRANCH);

  await seedUsers();

  for (const dept of seedDepartments) {
    await seedDocument('departments', dept.id, dept as unknown as Record<string, unknown>);
  }
  for (const test of seedTests) {
    await seedDocument('tests', test.id, test as unknown as Record<string, unknown>);
  }
  for (const patient of seedPatients) {
    await seedDocument('patients', patient.id, patient as unknown as Record<string, unknown>);
  }
  for (const order of seedOrders) {
    await seedDocument('orders', order.id, order as unknown as Record<string, unknown>);
  }
  for (const invoice of seedInvoices) {
    await seedDocument('invoices', invoice.id, invoice as unknown as Record<string, unknown>);
  }
  for (const sample of seedSamples) {
    await seedDocument('samples', sample.id, sample as unknown as Record<string, unknown>);
  }
  for (const result of seedResults) {
    await seedDocument('results', result.id, result as unknown as Record<string, unknown>);
  }

  return `Seeded ${DEMO_USERS.length} users, ${seedPatients.length} patients, ${seedOrders.length} orders, and lab records.`;
}

export async function ensureSeeded(): Promise<{ seeded: boolean; message: string }> {
  const usersEmpty = await isCollectionEmpty('users');
  if (!usersEmpty) {
    return { seeded: false, message: 'Database already has users.' };
  }
  const message = await runSeed();
  return { seeded: true, message };
}

export async function forceReseed(): Promise<{ seeded: boolean; message: string }> {
  const db = getAdminFirestore();
  const tables = ['users', 'patients', 'orders', 'invoices', 'samples', 'results', 'tests', 'departments', 'branches'];
  for (const table of tables) {
    const snap = await appCollection(db, table).get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
  const message = await runSeed();
  return { seeded: true, message };
}
