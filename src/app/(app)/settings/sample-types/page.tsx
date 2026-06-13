'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { SampleTypeFormModal } from '@/components/lims/settings/sample-type-form-modal';
import { StatusBadge } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import {
  addSampleType,
  deleteSampleType,
  getSampleTypes,
  updateSampleType,
} from '@/lib/data/sample-types-store';
import { getTests } from '@/lib/data/tests-store';
import type { SampleType } from '@/lib/types/lims';

export default function SettingsSampleTypesPage() {
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewSampleType, setViewSampleType] = useState<SampleType | null>(null);
  const [editSampleType, setEditSampleType] = useState<SampleType | null>(null);

  const refresh = () => setSampleTypes(getSampleTypes());

  useEffect(() => {
    refresh();
  }, []);

  const isUsedByTest = (name: string) => getTests().some((t) => t.sampleType === name);

  const handleDelete = (sampleType: SampleType) => {
    if (!window.confirm(`Delete sample type "${sampleType.name}"?`)) return;
    try {
      deleteSampleType(sampleType.id, isUsedByTest);
      refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete sample type.');
    }
  };

  return (
    <SettingsShell description="Specimen types — used in the test catalog and sample registration">
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
            {sampleTypes.map((type) => (
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
                    onView={() => setViewSampleType(type)}
                    onEdit={() => setEditSampleType(type)}
                    onDelete={() => handleDelete(type)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <SampleTypeFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            addSampleType(data);
            setShowCreateModal(false);
            refresh();
          }}
        />
      )}

      {viewSampleType && (
        <SampleTypeFormModal
          sampleType={viewSampleType}
          readOnly
          onClose={() => setViewSampleType(null)}
          onSave={() => {}}
        />
      )}

      {editSampleType && (
        <SampleTypeFormModal
          sampleType={editSampleType}
          onClose={() => setEditSampleType(null)}
          onSave={(data) => {
            updateSampleType(editSampleType.id, data);
            setEditSampleType(null);
            refresh();
          }}
        />
      )}
    </SettingsShell>
  );
}
