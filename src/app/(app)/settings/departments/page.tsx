"use client";

import { SettingsShell } from "@/components/lims/settings/settings-shell";
import { getDepartments } from "@/lib/data/store";

export default function SettingsDepartmentsPage() {
  const departments = getDepartments();

  return (
    <SettingsShell description="Laboratory departments — organize tests by specialty">
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
    </SettingsShell>
  );
}
