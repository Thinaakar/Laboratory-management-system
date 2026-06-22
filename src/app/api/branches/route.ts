import { listBranches } from '@/lib/firestore/app-data';
import { createBranchDb } from '@/lib/firestore/catalog-writes';
import { branchCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listBranches, 'settings.read');
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, branchCreateSchema, createBranchDb, 'settings.update');
  } catch (e) {
    return catalogError(e);
  }
}
