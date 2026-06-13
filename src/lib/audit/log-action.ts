import { getSession } from '@/lib/auth/demo-users';
import { addAuditLog } from '@/lib/data/audit-store';

export function logAuditAction(input: {
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
  userId?: string;
  userName?: string;
}) {
  if (typeof window === 'undefined') return;

  const session = getSession();
  addAuditLog({
    userId: input.userId ?? session?.email ?? 'SYSTEM',
    userName: input.userName ?? session?.name ?? 'System',
    action: input.action,
    module: input.module,
    details: input.details,
    ipAddress: input.ipAddress,
  });
}
