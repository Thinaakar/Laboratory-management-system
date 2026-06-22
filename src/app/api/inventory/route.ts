import { listInventory } from '@/lib/firestore/app-data';
import { createInventoryDb } from '@/lib/firestore/catalog-writes';
import { inventoryCreateSchema } from '@/lib/validation/catalog';
import { catalogCreate, catalogError, catalogList } from '@/lib/api/catalog-route-helpers';

export async function GET(request: Request) {
  try {
    return await catalogList(request, listInventory, 'inventory.read');
  } catch (e) {
    return catalogError(e);
  }
}

export async function POST(request: Request) {
  try {
    return await catalogCreate(request, inventoryCreateSchema, createInventoryDb, 'inventory.create');
  } catch (e) {
    return catalogError(e);
  }
}
