'use client';

import { useCallback, useEffect, useState } from 'react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { apiJson } from '@/lib/http/client';
import type { AuditLogEntry } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: AuditLogEntry[] }>('/api/audit');
      setLogs(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load audit logs.');
      setLogs([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <UserManagementShell>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="lims-card overflow-x-auto">
        <table className="lims-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Details</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted">
                  No audit entries yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.timestamp)}</td>
                  <td className="font-medium text-slate-900">{log.userName}</td>
                  <td>{log.action}</td>
                  <td>{log.module}</td>
                  <td className="max-w-xs truncate">{log.details ?? '—'}</td>
                  <td className="font-mono text-xs">{log.ipAddress ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </UserManagementShell>
  );
}
