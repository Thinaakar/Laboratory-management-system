import type { InventoryItem } from '@/lib/types/lims';

const STORAGE_KEY = 'labcore-inventory-v1';

export const INVENTORY_CATEGORY_OPTIONS: InventoryItem['category'][] = [
  'Reagent',
  'Chemical',
  'Test Kit',
  'Consumable',
];

export const seedInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'CBC Reagent Kit', category: 'Test Kit', quantity: 45, unit: 'kits', reorderLevel: 10, expiryDate: '2026-12-31', supplierId: 'SUP-001' },
  { id: 'INV-002', name: 'Glucose Reagent', category: 'Reagent', quantity: 8, unit: 'bottles', reorderLevel: 15, expiryDate: '2026-08-15', supplierId: 'SUP-001' },
  { id: 'INV-003', name: 'Vacutainer Tubes (EDTA)', category: 'Consumable', quantity: 320, unit: 'pcs', reorderLevel: 100 },
];

function cloneSeed(): InventoryItem[] {
  return seedInventory.map((i) => ({ ...i }));
}

function loadInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as InventoryItem[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveInventory(items: InventoryItem[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let memoryInventory = cloneSeed();

export function getInventory(): InventoryItem[] {
  if (typeof window !== 'undefined') {
    memoryInventory = loadInventory();
  }
  return memoryInventory.map((i) => ({ ...i }));
}

export function addInventoryItem(input: {
  name: string;
  category: InventoryItem['category'];
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate?: string;
  supplierId?: string;
}): InventoryItem {
  const items = getInventory();
  const created: InventoryItem = {
    id: `INV-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    quantity: input.quantity,
    unit: input.unit.trim(),
    reorderLevel: input.reorderLevel,
    expiryDate: input.expiryDate || undefined,
    supplierId: input.supplierId || undefined,
  };
  memoryInventory = [...items, created];
  saveInventory(memoryInventory);
  return created;
}
