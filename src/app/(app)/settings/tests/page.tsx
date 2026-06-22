'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { TestFormModal } from '@/components/lims/settings/test-form-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { apiJson } from '@/lib/http/client';
import { formatCurrency } from '@/lib/utils';
import type { LabTest } from '@/lib/types/lims';

export default function SettingsTestsPage() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: LabTest[] }>('/api/tests');
      setTests(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tests.');
      setTests([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Test catalog — pricing, sample types, and reference ranges">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Test
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Sample Type</th>
              <th>TAT (hrs)</th>
              <th>Unit</th>
              <th>Reference</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td className="font-mono text-xs">{t.id}</td>
                <td className="font-medium text-slate-900">{t.name}</td>
                <td>{t.departmentName}</td>
                <td>{t.sampleType}</td>
                <td>{t.turnaroundHours}</td>
                <td>{t.unit ?? '—'}</td>
                <td className="text-xs">{t.referenceRange ?? '—'}</td>
                <td>{formatCurrency(t.price)}</td>
                <td>
                  <StatusBadge
                    label={t.isActive ? 'Active' : 'Inactive'}
                    variant={t.isActive ? 'success' : 'neutral'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <TestFormModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/tests', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
