"use client";

import Link from "next/link";
import { AnalyticsPieChart } from "@/components/lims/analytics/analytics-pie-chart";
import { PageHeader } from "@/components/lims/page-header";
import { DashboardOverview } from "@/components/lims/dashboard-overview";
import { getAnalyticsSnapshot } from "@/lib/data/analytics";
import {
  getDashboardKpis,
  getPendingTestRows,
  getSampleTrend,
} from "@/lib/data/store";
import { formatCurrency } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Register Patient", href: "/patients?register=1" },
  { label: "Schedule Appointment", href: "/appointments?schedule=1" },
  { label: "Collect Payment", href: "/billing?collect=1" },
  { label: "Register Sample", href: "/samples?register=1" },
  { label: "Enter Results", href: "/results?filter=pending&entry=1" },
  { label: "Approve Reports", href: "/reports/approval" },
];

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  const pendingTests = getPendingTestRows();
  const sampleTrend = getSampleTrend();
  const samplePipeline = getAnalyticsSnapshot().sampleStatus;

  return (
    <div>
      <PageHeader title="Dashboard" description="Lab operations overview" />

      <DashboardOverview
        kpis={{
          totalPatients: kpis.totalPatients,
          todaySamples: kpis.todaySamples,
          completedReports: kpis.completedReports,
          revenueToday: kpis.revenueToday,
          todayRegistrations: kpis.todayRegistrations,
        }}
        pendingTests={pendingTests}
        sampleTrend={sampleTrend}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <AnalyticsPieChart
          title="Sample Pipeline"
          subtitle="Samples by processing stage"
          data={samplePipeline}
        />

        <div className="space-y-4">
          <div className="lims-card p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Quick Actions
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="lims-btn-secondary text-xs"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="lims-card p-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Today&apos;s Summary
            </h2>
            <dl className="mt-2.5 space-y-2 text-sm">
              <div className="flex justify-between border-b border-muted-border/60 pb-2">
                <dt className="text-muted">Samples collected</dt>
                <dd className="font-medium text-slate-900">
                  {kpis.todaySamples}
                </dd>
              </div>
              <div className="flex justify-between border-b border-muted-border/60 pb-2">
                <dt className="text-muted">New registrations</dt>
                <dd className="font-medium text-slate-900">
                  {kpis.todayRegistrations}
                </dd>
              </div>
              <div className="flex justify-between border-b border-muted-border/60 pb-2">
                <dt className="text-muted">Revenue collected</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(kpis.revenueToday)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Pending payments</dt>
                <dd className="font-medium text-slate-900">
                  {formatCurrency(kpis.outstandingPayments)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
