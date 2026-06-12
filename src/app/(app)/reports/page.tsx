'use client';

import { Download, Eye } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { HydrationSafeInput } from '@/components/lims/client-only';
import { ViewReportModal } from '@/components/lims/reports/view-report-modal';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import {
  allReportsDetailCsvRows,
  buildPatientReports,
  reportDetailCsvRows,
  type PatientReport,
} from '@/lib/data/reports';
import { downloadCsv } from '@/lib/utils/csv';
import { formatDateTime } from '@/lib/utils';

function ReportsContent() {
  const [search, setSearch] = useState('');
  const [viewReport, setViewReport] = useState<PatientReport | null>(null);
  const reports = useMemo(() => buildPatientReports(), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (report) =>
        report.reportId.toLowerCase().includes(q) ||
        report.orderId.toLowerCase().includes(q) ||
        report.patientId.toLowerCase().includes(q) ||
        report.patientName.toLowerCase().includes(q) ||
        report.approvedBy?.toLowerCase().includes(q),
    );
  }, [reports, search]);

  const handleExportCsv = () => {
    if (!filtered.length) return;
    downloadCsv('lab-reports', allReportsDetailCsvRows(filtered));
  };

  return (
    <>
      <FlashBanner />

      <div className="lims-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-muted-border bg-muted-bg/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <HydrationSafeInput
            type="search"
            className="lims-input max-w-sm bg-white"
            placeholder="Search by patient, order, or report ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="lims-btn-primary"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="lims-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient</th>
                <th>Order ID</th>
                <th>Tests</th>
                <th>Sample</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-muted">
                    {reports.length === 0
                      ? 'No approved reports yet. Complete pathologist approval to publish reports.'
                      : 'No reports match your search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.reportId}>
                    <td className="font-mono text-xs">{report.reportId}</td>
                    <td>
                      <p className="font-medium text-slate-900">{report.patientName}</p>
                      <p className="font-mono text-xs text-muted">{report.patientId}</p>
                    </td>
                    <td className="font-mono text-xs">{report.orderId}</td>
                    <td>{report.testCount}</td>
                    <td className="font-mono text-xs">
                      {report.samples[0]?.id ?? report.results[0]?.sampleId ?? '—'}
                    </td>
                    <td>
                      <StatusBadge label="Approved" variant={statusVariant('Approved')} />
                    </td>
                    <td>{report.approvedBy ?? '—'}</td>
                    <td>{report.approvedAt ? formatDateTime(report.approvedAt) : '—'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setViewReport(report)}
                          className="rounded-md p-2 text-muted transition-colors hover:bg-muted-bg hover:text-primary"
                          aria-label={`View report ${report.reportId}`}
                          title="View full report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            downloadCsv(`${report.reportId}-report`, reportDetailCsvRows(report))
                          }
                          className="rounded-md p-2 text-muted transition-colors hover:bg-muted-bg hover:text-primary"
                          aria-label={`Export report ${report.reportId}`}
                          title="Export CSV"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewReport && (
        <ViewReportModal report={viewReport} onClose={() => setViewReport(null)} />
      )}
    </>
  );
}

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Completed and approved patient reports" />
      <Suspense fallback={null}>
        <ReportsContent />
      </Suspense>
    </div>
  );
}
