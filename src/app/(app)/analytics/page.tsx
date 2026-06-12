'use client';

import { AnalyticsDashboard } from '@/components/lims/analytics/analytics-dashboard';
import { AnalyticsShell } from '@/components/lims/analytics/analytics-shell';

export default function AnalyticsPage() {
  return (
    <AnalyticsShell>
      <AnalyticsDashboard />
    </AnalyticsShell>
  );
}
