'use client';

import { useCallback, useEffect, useState } from 'react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { SupplierFormModal } from '@/components/lims/operations/supplier-form-modal';
import { apiJson } from '@/lib/http/client';
import type { Supplier } from '@/lib/types/lims';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function SettingsSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: Supplier[] }>('/api/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load suppliers.');
      setSuppliers([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Suppliers — vendors for reagents, kits, and consumables">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Supplier
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Email</th>
              <th>GST</th>
              <th>Total Purchases</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-slate-900">{s.name}</td>
                <td>{s.contact}</td>
                <td>{s.email ?? '—'}</td>
                <td className="font-mono text-xs">{s.gst ?? '—'}</td>
                <td>{formatCurrency(s.totalPurchases)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SupplierFormModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/suppliers', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
