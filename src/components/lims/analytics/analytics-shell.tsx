"use client";

import { PageHeader } from "@/components/lims/page-header";

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
      {children}
    </div>
  );
}
