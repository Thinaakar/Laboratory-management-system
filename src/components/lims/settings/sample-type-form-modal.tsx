'use client';

import { useState } from 'react';
import type { SampleType } from '@/lib/types/lims';

interface SampleTypeFormModalProps {
  sampleType?: SampleType;
  readOnly?: boolean;
  onClose: () => void;
  onSave: (data: { name: string; code: string; isActive: boolean }) => void;
}

export function SampleTypeFormModal({ sampleType, readOnly = false, onClose, onSave }: SampleTypeFormModalProps) {
  const isEdit = Boolean(sampleType) && !readOnly;
  const [name, setName] = useState(sampleType?.name ?? '');
  const [code, setCode] = useState(sampleType?.code ?? '');
  const [isActive, setIsActive] = useState(sampleType?.isActive ?? true);
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {readOnly ? 'Sample Type Details' : isEdit ? 'Edit Sample Type' : 'New Sample Type'}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {readOnly
            ? 'Specimen type used in tests and sample registration.'
            : isEdit
              ? 'Update specimen type used in tests and sample registration.'
              : 'Add a specimen type for tests and sample collection.'}
        </p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            try {
              onSave({ name, code, isActive });
            } catch (err) {
              setError(err instanceof Error ? err.message : `Could not ${isEdit ? 'update' : 'create'} sample type.`);
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              readOnly={readOnly}
              placeholder="e.g. Blood"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Code</label>
            <input
              className="lims-input font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              readOnly={readOnly}
              maxLength={6}
              placeholder="e.g. BLD"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <select
              className="lims-input"
              value={isActive ? 'Active' : 'Inactive'}
              onChange={(e) => setIsActive(e.target.value === 'Active')}
              disabled={readOnly}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button type="submit" className="lims-btn-primary">
                {isEdit ? 'Save Changes' : 'Create Sample Type'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
