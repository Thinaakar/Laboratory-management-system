'use client';

import { PageHeader } from '@/components/lims/page-header';
import { AnalyticsTabs } from '@/components/lims/analytics/analytics-tabs';

interface AnalyticsShellProps {
  children: React.ReactNode;
}

export function AnalyticsShell({ children }: AnalyticsShellProps) {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Operational insights, financial KPIs, and laboratory performance"
      />
      <AnalyticsTabs />
      {children}
    </div>
  );
}
