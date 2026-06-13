'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { PackageFormModal } from '@/components/lims/settings/package-form-modal';
import { addPackage, getPackages } from '@/lib/data/packages-store';
import { getTests } from '@/lib/data/tests-store';
import { formatCurrency } from '@/lib/utils';
import type { HealthPackage } from '@/lib/types/lims';

export default function SettingsPackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [tests, setTests] = useState(getTests());
  const [showModal, setShowModal] = useState(false);

  const refresh = () => {
    setPackages(getPackages());
    setTests(getTests());
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Health packages — bundled tests and package pricing">
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
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            addPackage(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
