'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { StatusBadge } from '@/components/lims/status-badge';
import { InventoryFormModal } from '@/components/lims/operations/inventory-form-modal';
import { addInventoryItem, getInventory } from '@/lib/data/inventory-store';
import type { InventoryItem } from '@/lib/types/lims';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setItems(getInventory());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Inventory — reagents, kits, and consumables">
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Item
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Level</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const lowStock = item.quantity <= item.reorderLevel;
              const expiringSoon =
                item.expiryDate &&
                new Date(item.expiryDate) < new Date(Date.now() + 90 * 86400000);
              return (
                <tr key={item.id}>
                  <td className="font-medium text-slate-900">{item.name}</td>
                  <td>{item.category}</td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>{item.reorderLevel}</td>
                  <td>{item.expiryDate ? formatDate(item.expiryDate) : '—'}</td>
                  <td>
                    {lowStock ? <StatusBadge label="Low Stock" variant="warning" /> : null}
                    {expiringSoon ? <StatusBadge label="Expiring Soon" variant="error" /> : null}
                    {!lowStock && !expiringSoon ? <StatusBadge label="OK" variant="success" /> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <InventoryFormModal
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            addInventoryItem(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
