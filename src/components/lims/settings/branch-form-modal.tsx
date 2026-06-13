'use client';

import { useState } from 'react';

interface BranchFormModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    isActive: boolean;
  }) => void;
}

export function BranchFormModal({ onClose, onSave }: BranchFormModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Branch</h3>
        <p className="mt-1 text-sm text-muted">Add a laboratory location for multi-branch operations.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            try {
              onSave({
                name,
                code,
                address: address || undefined,
                phone: phone || undefined,
                isActive,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create branch.');
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Branch name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Main Laboratory"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Code</label>
            <input
              className="lims-input font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              maxLength={8}
              placeholder="e.g. MAIN"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Address (optional)</label>
            <input
              className="lims-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Health Park, Mumbai"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Phone (optional)</label>
            <input
              className="lims-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 22 4000 1234"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <select
              className="lims-input"
              value={isActive ? 'Active' : 'Inactive'}
              onChange={(e) => setIsActive(e.target.value === 'Active')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
