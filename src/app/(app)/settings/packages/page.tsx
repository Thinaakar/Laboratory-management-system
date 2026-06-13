'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { getPackages, getTests } from '@/lib/data/store';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPackagesPage() {
  const packages = getPackages();
  const tests = getTests();

  return (
    <SettingsShell description="Health packages — bundled tests and package pricing">
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
    </SettingsShell>
  );
}
