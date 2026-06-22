'use client';

import { Download, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { StatusBadge } from '@/components/lims/status-badge';
import type { PatientReport } from '@/lib/data/reports';
import { reportDetailCsvRows } from '@/lib/data/reports';
import { calculateAgeFromDob } from '@/lib/data/patients-store';
import { downloadCsv } from '@/lib/utils/csv';
import { downloadReportPdf, qrDataUrlForReport, type ReportPdfOptions } from '@/lib/utils/report-pdf';
import { formatDate, formatDateTime } from '@/lib/utils';

interface ViewReportModalProps {
  report: PatientReport;
  pdfOptions?: ReportPdfOptions;
  onClose: () => void;
}

export function ViewReportModal({ report, pdfOptions, onClose }: ViewReportModalProps) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const patientAge = report.patient?.dateOfBirth
    ? calculateAgeFromDob(report.patient.dateOfBirth)
    : undefined;

  const showQr = pdfOptions?.includeQr !== false;

  useEffect(() => {
    if (!showQr) return;
    void qrDataUrlForReport(report.reportId).then(setQrUrl).catch(() => setQrUrl(null));
  }, [report.reportId, showQr]);

  const handleExportCsv = () => {
    downloadCsv(`${report.reportId}-report`, reportDetailCsvRows(report));
  };

  const handleExportPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadReportPdf(report, pdfOptions);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not generate PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
            <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Patient Report</h3>
                <p className="mt-1 text-sm text-muted">
                  {report.reportId} · {report.patientName}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-muted transition-colors hover:bg-muted-bg hover:text-slate-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-muted-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Patient</p>
                  <p className="mt-2 font-medium text-slate-900">{report.patientName}</p>
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Patient ID</dt>
                      <dd className="font-mono text-xs text-slate-900">{report.patientId}</dd>
                    </div>
                    {report.patient?.gender && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Gender</dt>
                        <dd className="text-slate-900">{report.patient.gender}</dd>
                      </div>
                    )}
                    {patientAge != null && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Age</dt>
                        <dd className="text-slate-900">{patientAge} years</dd>
                      </div>
                    )}
                    {report.patient?.phone && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Phone</dt>
                        <dd className="text-slate-900">{report.patient.phone}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-lg border border-muted-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Order &amp; Sample</p>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Order ID</dt>
                      <dd className="font-mono text-xs text-slate-900">{report.orderId}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Referring Doctor</dt>
                      <dd className="text-slate-900">{report.referringDoctor ?? 'None'}</dd>
                    </div>
                    {report.samples[0] && (
                      <>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">Sample ID</dt>
                          <dd className="font-mono text-xs text-slate-900">{report.samples[0].id}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">Barcode</dt>
                          <dd className="font-mono text-xs text-slate-900">{report.samples[0].barcode}</dd>
                        </div>
                        {report.samples[0].collectedAt && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-muted">Collected</dt>
                            <dd className="text-slate-900">
                              {formatDateTime(report.samples[0].collectedAt!)}
                            </dd>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Approved By</dt>
                      <dd className="text-slate-900">{report.approvedBy ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Approved</dt>
                      <dd className="text-slate-900">
                        {report.approvedAt ? formatDateTime(report.approvedAt) : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {showQr && qrUrl && (
                <div className="flex items-center gap-4 rounded-lg border border-muted-border bg-muted-bg/40 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt={`QR code for ${report.reportId}`} className="h-20 w-20 rounded-md bg-white p-1" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Verification QR</p>
                    <p className="mt-1 text-sm text-slate-700">
                      Scan to verify this report. Included on PDF downloads when QR verification is enabled in
                      settings.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  Test Results ({report.testCount})
                </p>
                <div className="overflow-hidden rounded-lg border border-muted-border">
                  <table className="lims-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Value</th>
                        <th>Reference</th>
                        <th>Critical</th>
                        <th>Entered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.results.map((result) => (
                        <tr key={result.id}>
                          <td className="font-medium text-slate-900">{result.testName}</td>
                          <td>
                            {result.value}
                            {result.unit && (
                              <span className="ml-1 text-xs text-muted">{result.unit}</span>
                            )}
                          </td>
                          <td className="text-muted">{result.referenceRange ?? '—'}</td>
                          <td>
                            {result.isCritical ? (
                              <StatusBadge label="Critical" variant="error" />
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="text-xs text-muted">
                            {result.enteredAt ? formatDate(result.enteredAt) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {report.results.some((r) => r.pathologistNotes) && (
                <div className="rounded-lg border border-muted-border bg-muted-bg/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Notes</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {report.results.find((r) => r.pathologistNotes)?.pathologistNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
              <button type="button" onClick={onClose} className="lims-btn-secondary">
                Close
              </button>
              <button type="button" onClick={handleExportCsv} className="lims-btn-secondary">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => void handleExportPdf()}
                disabled={pdfLoading}
                className="lims-btn-primary"
              >
                <FileText className="h-4 w-4" />
                {pdfLoading ? 'Generating…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
