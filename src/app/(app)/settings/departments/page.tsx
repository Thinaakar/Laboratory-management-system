'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { DepartmentFormModal } from '@/components/lims/settings/department-form-modal';
import { apiJson } from '@/lib/http/client';
import type { TestDepartment } from '@/lib/types/lims';

export default function SettingsDepartmentsPage() {
  const [departments, setDepartments] = useState<TestDepartment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: TestDepartment[] }>('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load departments.');
      setDepartments([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <SettingsShell description="Laboratory departments — organize tests by specialty">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Department
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Department ID</th>
              <th>Name</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td className="font-mono text-xs">{dept.id}</td>
                <td className="font-medium text-slate-900">{dept.name}</td>
                <td className="font-mono text-xs">{dept.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DepartmentFormModal
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await apiJson('/api/departments', { method: 'POST', body: JSON.stringify(data) });
            setShowModal(false);
            await refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
