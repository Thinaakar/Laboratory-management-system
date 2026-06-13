'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { DepartmentFormModal } from '@/components/lims/settings/department-form-modal';
import { addDepartment, getDepartments } from '@/lib/data/departments-store';
import type { TestDepartment } from '@/lib/types/lims';

export default function SettingsDepartmentsPage() {
  const [departments, setDepartments] = useState<TestDepartment[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setDepartments(getDepartments());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SettingsShell description="Laboratory departments — organize tests by specialty">
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
          onSave={(data) => {
            addDepartment(data);
            setShowModal(false);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
