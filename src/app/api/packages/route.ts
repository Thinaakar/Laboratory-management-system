import { listPackages } from '@/lib/firestore/app-data';
import { createPackageDb } from '@/lib/firestore/catalog-writes';
import { packageCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listPackages);
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, packageCreateSchema, createPackageDb);
  } catch (e) {
    return catalogError(e);
  }
}
