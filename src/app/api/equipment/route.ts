import { listEquipment } from '@/lib/firestore/app-data';
import { createEquipmentDb } from '@/lib/firestore/catalog-writes';
import { equipmentCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listEquipment, 'equipment.read');
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, equipmentCreateSchema, createEquipmentDb, 'equipment.update');
  } catch (e) {
    return catalogError(e);
  }
}
