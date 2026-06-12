'use client';

import { PageHeader } from '@/components/lims/page-header';
import { OperationsTabs } from '@/components/lims/operations/operations-tabs';

interface OperationsShellProps {
  children: React.ReactNode;
}

export function OperationsShell({ children }: OperationsShellProps) {
  return (
    <div>
      <PageHeader
        title="Operations"
        description="Inventory, suppliers, and equipment management"
      />
      <OperationsTabs />
      {children}
    </div>
  );
}
