"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  TestTube2,
  TrendingUp,
  Users,
} from "lucide-react";
import { KpiCard } from "@/components/lims/kpi-card";
import { AnalyticsBarChart } from "@/components/lims/analytics/analytics-bar-chart";
import { AnalyticsPieChart } from "@/components/lims/analytics/analytics-pie-chart";
import {
  ANALYTICS_PERIODS,
  getAnalyticsSnapshot,
  getAnalyticsTrendSubtitle,
  type AnalyticsPeriod,
} from "@/lib/data/analytics";
import { cn, formatCurrency } from "@/lib/utils";

interface KpiDef {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  sub?: string;
}

function periodKpiSuffix(period: AnalyticsPeriod): string {
  switch (period) {
    case "daily":
      return "today";
    case "weekly":
      return "last 7 days";
    case "monthly":
      return "this month";
    default:
      return "all time";
  }
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("overall");
  const [data, setData] = useState<ReturnType<typeof getAnalyticsSnapshot> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(getAnalyticsSnapshot(period));
    setReady(true);
  }, [period]);

  const trendSubtitle = getAnalyticsTrendSubtitle(period);
  const kpiSuffix = periodKpiSuffix(period);

  const kpiCards: KpiDef[] = useMemo(() => {
    if (!data) return [];
    const { kpis } = data;
    return [
      {
        label: "Patients",
        value: kpis.totalPatients.toLocaleString("en-IN"),
        icon: Users,
        color: "bg-primary/10 text-primary",
        sub: `Registered ${kpiSuffix}`,
      },
      {
        label: "Samples",
        value: kpis.totalSamples.toLocaleString("en-IN"),
        icon: TestTube2,
        color: "bg-emerald-50 text-emerald-600",
        sub: `Collected ${kpiSuffix}`,
      },
      {
        label: "Revenue",
        value: formatCurrency(kpis.periodRevenue),
        icon: TrendingUp,
        color: "bg-violet-50 text-violet-600",
        sub: `Collected ${kpiSuffix}`,
      },
      {
        label: "Pending Tests",
        value: String(kpis.pendingTests),
        icon: Activity,
        color: "bg-sky-50 text-sky-600",
        sub: `Awaiting approval ${kpiSuffix}`,
      },
    ];
  }, [data, kpiSuffix]);

  if (!ready || !data) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Loading analytics…
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-muted-border bg-white p-1">
        {ANALYTICS_PERIODS.map((option) => {
          const active = period === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriod(option.id)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-muted-bg hover:text-slate-900",
              )}
              title={option.description}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-muted">
        Viewing <span className="font-medium text-slate-700">{data.periodLabel}</span> analytics —{" "}
        {ANALYTICS_PERIODS.find((p) => p.id === period)?.description.toLowerCase()}
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <KpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            icon={k.icon}
            iconClassName={k.color}
            sub={k.sub}
          />
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Sample Volume"
          subtitle={`Samples registered — ${trendSubtitle}`}
          data={data.sampleTrend}
        />
        <AnalyticsBarChart
          title="Revenue Collected"
          subtitle={`Payments received — ${trendSubtitle}`}
          data={data.revenueTrend}
          valueFormat="currency"
        />
      </div>

      <div className="mb-4">
        <AnalyticsBarChart
          title="Top Tests by Orders"
          subtitle={`Most ordered tests — ${kpiSuffix}`}
          data={data.topTests}
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <AnalyticsPieChart
          title="Payment Status"
          subtitle={`Invoice collection — ${kpiSuffix}`}
          data={data.paymentStatus}
        />
        <AnalyticsPieChart
          title="Sample Pipeline"
          subtitle={`Samples by stage — ${kpiSuffix}`}
          data={data.sampleStatus}
        />
        <AnalyticsPieChart
          title="Tests by Status"
          subtitle={`Lab queue pipeline — ${kpiSuffix}`}
          data={data.testStatus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPieChart
          title="Tests by Department"
          subtitle={`Order volume — ${kpiSuffix}`}
          data={data.departmentMix}
        />
        <div className="lims-card p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Operations Summary
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {data.periodLabel} metrics at a glance
          </p>
          <dl className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "Patients registered", value: kpis.totalPatients },
              { label: "Samples processed", value: kpis.totalSamples },
              { label: "Lab orders", value: kpis.totalOrders },
              { label: "Reports approved", value: kpis.completedReports },
              { label: "Pending approvals", value: kpis.pendingTests },
              { label: "Low stock alerts", value: kpis.lowStockItems },
              { label: "Active staff", value: kpis.activeStaff },
              {
                label: "Outstanding dues",
                value: formatCurrency(kpis.outstandingPayments),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-900">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
