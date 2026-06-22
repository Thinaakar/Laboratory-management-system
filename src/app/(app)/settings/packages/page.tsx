'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { PackageFormModal } from '@/components/lims/settings/package-form-modal';
import { apiJson } from '@/lib/http/client';
import { formatCurrency } from '@/lib/utils';
import type { HealthPackage, LabTest } from '@/lib/types/lims';

export default function SettingsPackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [pkgRes, testRes] = await Promise.all([
        apiJson<{ data: HealthPackage[] }>('/api/packages'),
        apiJson<{ data: LabTest[] }>('/api/tests'),
      ]);
      setPackages(pkgRes.data);
      setTests(testRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load packages.');
      setPackages([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Health packages — bundled tests and package pricing">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Package
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Tests Included</th>
              <th>Price</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td className="font-medium text-slate-900">{pkg.name}</td>
                <td>
                  {pkg.testIds
                    .map((id) => tests.find((t) => t.id === id)?.name ?? id)
                    .join(', ')}
                </td>
                <td>{formatCurrency(pkg.price)}</td>
                <td className="text-muted">{pkg.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <PackageFormModal
          tests={tests}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/packages', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
