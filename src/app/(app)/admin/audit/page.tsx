'use client';

import { useEffect, useState } from 'react';
import { UserManagementShell } from '@/components/lims/access/user-management-shell';
import { getAuditLogs } from '@/lib/data/audit-store';
import type { AuditLogEntry } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  const refresh = () => setLogs(getAuditLogs());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <UserManagementShell>
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
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.timestamp)}</td>
                <td className="font-medium text-slate-900">{log.userName}</td>
                <td>{log.action}</td>
                <td>{log.module}</td>
                <td className="max-w-xs truncate">{log.details ?? '—'}</td>
                <td className="font-mono text-xs">{log.ipAddress ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </UserManagementShell>
  );
}
