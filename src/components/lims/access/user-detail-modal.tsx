'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge } from '@/components/lims/status-badge';
import { apiJson } from '@/lib/http/client';
import type { Branch } from '@/lib/types/lims';
import type { LimsUser } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

interface UserDetailModalProps {
  user: LimsUser;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const [branchName, setBranchName] = useState(user.branchId ?? '—');

  useEffect(() => {
    if (!user.branchId) return;
    void apiJson<{ data: Branch[] }>('/api/branches')
      .then((res) => {
        const branch = res.data.find((b) => b.id === user.branchId);
        setBranchName(branch?.name ?? user.branchId ?? '—');
      })
      .catch(() => setBranchName(user.branchId ?? '—'));
  }, [user.branchId]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">User Details</h3>
                <p className="mt-0.5 font-mono text-sm text-muted">{user.id}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="lims-dialog-body space-y-4">
              <DetailRow label="Full Name" value={user.displayName} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Mobile" value={user.mobile || '—'} />
              <DetailRow label="Username" value={<span className="font-mono">{user.username}</span>} />
              <DetailRow label="Department" value={user.department} />
              <DetailRow label="Role" value={user.role} />
              <DetailRow label="Branch" value={branchName} />
              <DetailRow
                label="Status"
                value={
                  <StatusBadge label={user.status} variant={user.status === 'Active' ? 'success' : 'neutral'} />
                }
              />
              <DetailRow label="Created" value={formatDateTime(user.createdAt)} />
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
