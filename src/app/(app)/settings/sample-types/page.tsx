'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { SampleTypeFormModal } from '@/components/lims/settings/sample-type-form-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { apiJson } from '@/lib/http/client';
import type { SampleType } from '@/lib/types/lims';

export default function SettingsSampleTypesPage() {
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewType, setViewType] = useState<SampleType | null>(null);
  const [editType, setEditType] = useState<SampleType | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: SampleType[] }>('/api/sample-types');
      setSampleTypes(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sample types.');
      setSampleTypes([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleDelete = async (type: SampleType) => {
    if (!window.confirm(`Delete sample type "${type.name}"?`)) return;
    try {
      await apiJson(`/api/sample-types/${type.id}`, { method: 'DELETE' });
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete sample type.');
    }
  };

  return (
    <SettingsShell description="Specimen types — used in the test catalog and sample registration">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => setShowCreateModal(true)} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          New Sample Type
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Sample Type ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
              <th className="w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted">
                  No sample types found.
                </td>
              </tr>
            ) : (
              sampleTypes.map((type) => (
                <tr key={type.id}>
                  <td className="font-mono text-xs">{type.id}</td>
                  <td className="font-medium text-slate-900">{type.name}</td>
                  <td className="font-mono text-xs">{type.code}</td>
                  <td>
                    <StatusBadge
                      label={type.isActive ? 'Active' : 'Inactive'}
                      variant={type.isActive ? 'success' : 'neutral'}
                    />
                  </td>
                  <td>
                    <TableRowActions
                      onView={() => setViewType(type)}
                      onEdit={() => setEditType(type)}
                      onDelete={() => void handleDelete(type)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <SampleTypeFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={async (data) => {
            await apiJson('/api/sample-types', { method: 'POST', body: JSON.stringify(data) });
            setShowCreateModal(false);
            await refresh();
          }}
        />
      )}

      {editType && (
        <SampleTypeFormModal
          sampleType={editType}
          onClose={() => setEditType(null)}
          onSave={async (data) => {
            await apiJson(`/api/sample-types/${editType.id}`, {
              method: 'PATCH',
              body: JSON.stringify(data),
            });
            setEditType(null);
            await refresh();
          }}
        />
      )}

      {viewType && (
        <SampleTypeFormModal
          sampleType={viewType}
          readOnly
          onClose={() => setViewType(null)}
          onSave={() => {}}
        />
      )}
    </SettingsShell>
  );
}
