import { listDepartments } from '@/lib/firestore/app-data';
import { createDepartmentDb } from '@/lib/firestore/catalog-writes';
import { departmentCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listDepartments);
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, departmentCreateSchema, createDepartmentDb);
  } catch (e) {
    return catalogError(e);
  }
}
