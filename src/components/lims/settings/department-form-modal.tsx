'use client';

import { useState } from 'react';

interface DepartmentFormModalProps {
  onClose: () => void;
  onSave: (data: { name: string; code: string }) => void;
}

export function DepartmentFormModal({ onClose, onSave }: DepartmentFormModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Department</h3>
        <p className="mt-1 text-sm text-muted">Add a laboratory department to organize tests.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            try {
              onSave({ name, code });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create department.');
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Department name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Hematology"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Code</label>
            <input
              className="lims-input font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              maxLength={6}
              placeholder="e.g. HEM"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
