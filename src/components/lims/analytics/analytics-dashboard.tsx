'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Calendar,
  FileCheck,
  Package,
  TestTube2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { AnalyticsBarChart } from '@/components/lims/analytics/analytics-bar-chart';
import { AnalyticsPieChart } from '@/components/lims/analytics/analytics-pie-chart';
import { useClientData } from '@/hooks/use-hydrated';
import { getAnalyticsSnapshot } from '@/lib/data/analytics';
import { cn, formatCurrency } from '@/lib/utils';

interface KpiDef {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  sub?: string;
}

export function AnalyticsDashboard() {
  const { data, ready } = useClientData(() => getAnalyticsSnapshot());

  if (!ready || !data) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Loading analytics…
      </div>
    );
  }

  const { kpis } = data;

  const kpiCards: KpiDef[] = [
    {
      label: 'Total Patients',
      value: kpis.totalPatients.toLocaleString('en-IN'),
      icon: Users,
      color: 'bg-primary/10 text-primary',
      sub: 'Registered in system',
    },
    {
      label: 'Total Samples',
      value: kpis.totalSamples.toLocaleString('en-IN'),
      icon: TestTube2,
      color: 'bg-emerald-50 text-emerald-600',
      sub: 'All time collected',
    },
    {
      label: 'Monthly Revenue',
      value: formatCurrency(kpis.monthlyRevenue),
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600',
      sub: `${formatCurrency(kpis.revenueToday)} today`,
    },
    {
      label: 'Pending Tests',
      value: String(kpis.pendingTests),
      icon: Activity,
      color: 'bg-amber-50 text-amber-600',
      sub: 'Awaiting approval',
    },
    {
      label: 'Completed Reports',
      value: String(kpis.completedReports),
      icon: FileCheck,
      color: 'bg-cyan-50 text-cyan-600',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(kpis.outstandingPayments),
      icon: Wallet,
      color: 'bg-rose-50 text-rose-600',
      sub: 'Unpaid invoices',
    },
    {
      label: 'Orders',
      value: String(kpis.totalOrders),
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      sub: 'Active lab orders',
    },
    {
      label: 'Appointments Today',
      value: String(kpis.todayAppointments),
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600',
      sub: `${kpis.activeStaff} active staff`,
    },
  ];

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <div
            key={k.label}
            className="lims-card p-4"
          >
            <div className={cn('inline-flex rounded-lg p-2', k.color)}>
              <k.icon size={18} />
            </div>
            <p className="mt-2 text-xs font-medium text-muted">{k.label}</p>
            <p className="text-xl font-bold text-slate-900">{k.value}</p>
            {k.sub && <p className="mt-0.5 text-xs text-muted">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Sample Volume"
          subtitle="Samples registered — last 7 days"
          data={data.sampleTrend}
        />
        <AnalyticsBarChart
          title="Revenue Collected"
          subtitle="Payments received — last 7 days"
          data={data.revenueTrend}
          valueFormat="currency"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AnalyticsBarChart
          title="Top Tests by Orders"
          subtitle="Most ordered tests in the lab"
          data={data.topTests}
        />
        <AnalyticsPieChart
          title="Report Approval Status"
          subtitle="Pathologist review pipeline"
          data={data.reportStatus}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <AnalyticsPieChart
          title="Payment Status"
          subtitle="Invoice collection overview"
          data={data.paymentStatus}
        />
        <AnalyticsPieChart
          title="Sample Pipeline"
          subtitle="Samples by processing stage"
          data={data.sampleStatus}
        />
        <AnalyticsPieChart
          title="Order Status"
          subtitle="Lab order fulfillment"
          data={data.orderStatus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnalyticsPieChart
          title="Tests by Department"
          subtitle="Order volume across departments"
          data={data.departmentMix}
        />
        <div className="lims-card p-5">
          <h2 className="text-sm font-semibold text-slate-900">Operations Summary</h2>
          <p className="mt-1 text-xs text-muted">Key metrics at a glance</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Patients registered', value: kpis.totalPatients },
              { label: 'Samples processed', value: kpis.totalSamples },
              { label: 'Lab orders', value: kpis.totalOrders },
              { label: 'Reports approved', value: kpis.completedReports },
              { label: 'Pending approvals', value: kpis.pendingTests },
              { label: 'Low stock alerts', value: kpis.lowStockItems },
              { label: 'Active staff', value: kpis.activeStaff },
              { label: 'Outstanding dues', value: formatCurrency(kpis.outstandingPayments) },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-muted-border/60 bg-muted-bg/40 px-3 py-2.5"
              >
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-900">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
