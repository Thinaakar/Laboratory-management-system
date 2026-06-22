"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnalyticsPieChart } from "@/components/lims/analytics/analytics-pie-chart";
import { PageHeader } from "@/components/lims/page-header";
import { DashboardOverview } from "@/components/lims/dashboard-overview";
import { getLimsData } from "@/lib/api/use-lims-data";
import {
  buildPendingTestRows,
  buildSampleTrend,
  type PendingTestRow,
  type SampleTrendDay,
} from "@/lib/data/store";
import type { ChartSlice } from "@/lib/data/analytics";
import type { DashboardKpis } from "@/lib/types/lims";
import { formatCurrency } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Register Patient", href: "/patients?register=1" },
  { label: "Schedule Appointment", href: "/appointments?schedule=1" },
  { label: "Collect Payment", href: "/billing?collect=1" },
  { label: "Register Sample", href: "/samples?register=1" },
  { label: "Enter Results", href: "/results?filter=pending&entry=1" },
  { label: "Approve Reports", href: "/reports/approval" },
];

const EMPTY_KPIS: DashboardKpis = {
  totalPatients: 0,
  todayRegistrations: 0,
  todaySamples: 0,
  pendingTests: 0,
  completedReports: 0,
  revenueToday: 0,
  monthlyRevenue: 0,
  outstandingPayments: 0,
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis>(EMPTY_KPIS);
  const [pendingTests, setPendingTests] = useState<PendingTestRow[]>([]);
  const [sampleTrend, setSampleTrend] = useState<SampleTrendDay[]>([]);
  const [samplePipeline, setSamplePipeline] = useState<ChartSlice[]>([]);

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    const [kpisData, results, orders, samples, analytics] = await Promise.all([
      api.dashboard.kpis(),
      api.results.list(),
      api.orders.list(),
      api.samples.list(),
      api.analytics.snapshot("overall"),
    ]);
    setKpis(kpisData);
    setPendingTests(buildPendingTestRows(results, orders));
    setSampleTrend(buildSampleTrend(samples));
    setSamplePipeline(analytics.sampleStatus);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
