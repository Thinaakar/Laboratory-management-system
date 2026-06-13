'use client';

import { PageHeader } from '@/components/lims/page-header';
import { AdminAccessTabs } from '@/components/lims/access/admin-access-tabs';

interface UserManagementShellProps {
  children: React.ReactNode;
}

export function UserManagementShell({ children }: UserManagementShellProps) {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="Staff accounts, roles, permissions, and audit trail"
      />
      <AdminAccessTabs />
      {children}
    </div>
  );
}
