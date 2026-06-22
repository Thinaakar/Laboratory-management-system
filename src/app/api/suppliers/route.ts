import { listSuppliers } from '@/lib/firestore/app-data';
import { createSupplierDb } from '@/lib/firestore/catalog-writes';
import { supplierCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listSuppliers, 'inventory.read');
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, supplierCreateSchema, createSupplierDb, 'inventory.create');
  } catch (e) {
    return catalogError(e);
  }
}
