'use client';

import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge } from '@/components/lims/status-badge';
import { LIMS_PERMISSIONS } from '@/lib/auth/permissions';
import type { LimsRole } from '@/lib/data/roles-store';
import { cn } from '@/lib/utils';

interface RoleDetailModalProps {
  role: LimsRole;
  userCount: number;
  onClose: () => void;
}

const ROLE_BADGE: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-orange-50 text-orange-600 border-orange-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function RoleDetailModal({ role, userCount, onClose }: RoleDetailModalProps) {
  const permissionLabels = role.permissions.map(
    (id) => LIMS_PERMISSIONS.find((p) => p.id === id)?.label ?? id,
  );

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Role Details</h3>
                <p className="mt-0.5 text-sm text-muted">{role.id}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="lims-dialog-body space-y-4">
              <DetailRow
                label="Role"
                value={
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                      ROLE_BADGE[role.color] ?? ROLE_BADGE.blue,
                    )}
                  >
                    {role.label}
                  </span>
                }
              />
              <DetailRow label="Description" value={role.description} />
              <DetailRow label="Users Assigned" value={String(userCount)} />
              <DetailRow label="Permissions" value={`${role.permissions.length} total`} />
              <DetailRow
                label="Status"
                value={
                  <StatusBadge label={role.status} variant={role.status === 'Active' ? 'success' : 'neutral'} />
                }
              />
              <DetailRow label="Type" value={role.isSystem ? 'System role' : 'Custom role'} />
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Permission List</p>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
                  {permissionLabels.map((label) => (
                    <li key={label}>• {label}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lims-dialog-footer">
              <button type="button" onClick={onClose} className="lims-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
