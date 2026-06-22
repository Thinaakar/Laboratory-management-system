import { listSampleTypes } from '@/lib/firestore/app-data';
import { createSampleTypeDb } from '@/lib/firestore/catalog-writes';
import { sampleTypeCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listSampleTypes);
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, sampleTypeCreateSchema, createSampleTypeDb);
  } catch (e) {
    return catalogError(e);
  }
}
