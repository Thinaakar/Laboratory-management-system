import { listReferrals } from '@/lib/firestore/app-data';
import { createReferralDb } from '@/lib/firestore/catalog-writes';
import { referralCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listReferrals);
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, referralCreateSchema, createReferralDb);
  } catch (e) {
    return catalogError(e);
  }
}
