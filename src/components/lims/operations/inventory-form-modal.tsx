'use client';

import { useState } from 'react';
import type { InventoryItem } from '@/lib/types/lims';
import { INVENTORY_CATEGORY_OPTIONS } from '@/lib/data/inventory-store';
import { getSuppliers } from '@/lib/data/suppliers-store';

interface InventoryFormModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: InventoryItem['category'];
    quantity: number;
    unit: string;
    reorderLevel: number;
    expiryDate?: string;
    supplierId?: string;
  }) => void;
}

export function InventoryFormModal({ onClose, onSave }: InventoryFormModalProps) {
  const suppliers = getSuppliers();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Reagent');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('pcs');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [expiryDate, setExpiryDate] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Inventory Item</h3>
        <p className="mt-1 text-sm text-muted">Track reagents, kits, and consumables in stock.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              name,
              category,
              quantity: Number(quantity),
              unit,
              reorderLevel: Number(reorderLevel),
              expiryDate: expiryDate || undefined,
              supplierId: supplierId || undefined,
            });
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Item name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. CBC Reagent Kit"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Category</label>
            <select
              className="lims-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
            >
              {INVENTORY_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Quantity</label>
              <input
                type="number"
                min={0}
                className="lims-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Unit</label>
              <input
                className="lims-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="kits, bottles, pcs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Reorder level</label>
              <input
                type="number"
                min={0}
                className="lims-input"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Expiry date</label>
              <input
                type="date"
                className="lims-input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Supplier (optional)</label>
            <select
              className="lims-input"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
