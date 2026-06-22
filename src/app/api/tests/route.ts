import { listTests } from '@/lib/firestore/app-data';
import { createTestDb } from '@/lib/firestore/catalog-writes';
import { testCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listTests);
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, testCreateSchema, createTestDb);
  } catch (e) {
    return catalogError(e);
  }
}
