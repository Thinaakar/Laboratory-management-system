'use client';

import { useState } from 'react';
import type { LimsRole, RoleStatus } from '@/lib/data/roles-store';

interface RoleFormModalProps {
  mode: 'create' | 'edit';
  role?: LimsRole;
  onClose: () => void;
  onSave: (data: {
    label: string;
    description: string;
    status: RoleStatus;
    color: string;
    permissions: string[];
  }) => void;
}

const COLORS = ['primary', 'blue', 'emerald', 'violet', 'amber'];

export function RoleFormModal({ mode, role, onClose, onSave }: RoleFormModalProps) {
  const [label, setLabel] = useState(role?.label ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [status, setStatus] = useState<RoleStatus>(role?.status ?? 'Active');
  const [color, setColor] = useState(role?.color ?? 'blue');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {mode === 'create' ? 'Create Role' : 'Edit Role'}
        </h3>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              label: label.trim(),
              description: description.trim(),
              status,
              color,
              permissions: role?.permissions ?? ['dashboard.read'],
            });
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Role name</label>
            <input
              className="lims-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              disabled={role?.isSystem}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Description</label>
            <textarea
              className="lims-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Status</label>
              <select
                className="lims-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as RoleStatus)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Color</label>
              <select className="lims-input" value={color} onChange={(e) => setColor(e.target.value)}>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {mode === 'create' && (
            <p className="text-xs text-muted">
              New roles start with dashboard access. Assign full permissions on the Permissions tab.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              {mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
