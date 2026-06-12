'use client';

import { PageHeader } from '@/components/lims/page-header';
import { CatalogTabs } from '@/components/lims/catalog/catalog-tabs';

interface CatalogShellProps {
  children: React.ReactNode;
}

export function CatalogShell({ children }: CatalogShellProps) {
  return (
    <div>
      <PageHeader
        title="Catalog"
        description="Laboratory tests, health packages, and pricing"
      />
      <CatalogTabs />
      {children}
    </div>
  );
}
