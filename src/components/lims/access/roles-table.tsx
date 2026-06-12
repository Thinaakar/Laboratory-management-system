'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Shield, Users, Pencil, Trash2 } from 'lucide-react';
import type { LimsRole } from '@/lib/data/roles-store';
import { StatusBadge } from '@/components/lims/status-badge';
import { cn } from '@/lib/utils';

const ROLE_BADGE: Record<string, string> = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

interface RolesTableProps {
  roles: LimsRole[];
  getUserCountByRole: (name: string) => number;
  onCreate: () => void;
  onEdit: (role: LimsRole) => void;
  onDelete: (role: LimsRole) => void;
}

export function RolesTable({ roles, getUserCountByRole, onCreate, onEdit, onDelete }: RolesTableProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q),
    );
  }, [roles, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles…"
            className="lims-input pl-9"
          />
        </div>
        <button type="button" onClick={onCreate} className="lims-btn-primary">
          <Plus className="h-4 w-4" />
          Create Role
        </button>
      </div>

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th>Users</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((role) => (
              <tr key={role.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                        ROLE_BADGE[role.color] ?? ROLE_BADGE.blue,
                      )}
                    >
                      {role.label}
                    </span>
                    {role.isSystem && (
                      <span className="text-[10px] font-medium uppercase text-muted">System</span>
                    )}
                  </div>
                </td>
                <td className="max-w-xs text-muted">{role.description}</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5 text-muted" />
                    {getUserCountByRole(role.name)}
                  </span>
                </td>
                <td className="text-sm font-medium">{role.permissions.length}</td>
                <td>
                  <StatusBadge label={role.status} variant={role.status === 'Active' ? 'success' : 'neutral'} />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(role)}
                      className="lims-btn-secondary px-2 py-1 text-xs"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => onDelete(role)}
                        className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted">
            <Shield className="mx-auto mb-2 h-8 w-8 opacity-40" />
            No roles found
          </div>
        )}
      </div>
    </div>
  );
}
