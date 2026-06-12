'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { OperationsShell } from '@/components/lims/operations/operations-shell';
import { SupplierFormModal } from '@/components/lims/operations/supplier-form-modal';
import { addSupplier, getSuppliers } from '@/lib/data/suppliers-store';
import type { Supplier } from '@/lib/types/lims';
import { formatCurrency } from '@/lib/utils';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setSuppliers(getSuppliers());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <OperationsShell>
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
          onSave={(data) => {
            addSupplier(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </OperationsShell>
  );
}
