import type { LabOrder, Patient, Sample, TestResult } from '@/lib/types/lims';
import { getOrders, getPatients, getResults, getSamples } from '@/lib/data/store';
import { formatDateTime } from '@/lib/utils';

export interface PatientReport {
  reportId: string;
  orderId: string;
  patientId: string;
  patientName: string;
  patient?: Patient;
  order?: LabOrder;
  samples: Sample[];
  results: TestResult[];
  testCount: number;
  approvedBy?: string;
  approvedAt?: string;
  referringDoctor?: string;
}

function reportIdFromOrder(orderId: string): string {
  return orderId.replace(/^ORD-/, 'RPT-');
}

function latestTimestamp(results: TestResult[], field: 'approvedAt' | 'enteredAt'): string | undefined {
  const values = results
    .map((r) => r[field])
    .filter(Boolean)
    .sort()
    .reverse();
  return values[0];
}

export interface ReportDataSource {
  results: TestResult[];
  orders: LabOrder[];
  patients: Patient[];
  samples: Sample[];
}

export function buildPatientReportsFromData(data: ReportDataSource): PatientReport[] {
  const approved = data.results.filter((r) => r.approvalStatus === 'Approved');
  const { orders, patients, samples } = data;

  const byOrder = new Map<string, TestResult[]>();
  for (const result of approved) {
    const list = byOrder.get(result.orderId) ?? [];
    list.push(result);
    byOrder.set(result.orderId, list);
  }

  return Array.from(byOrder.entries())
    .map(([orderId, results]) => {
      const order = orders.find((o) => o.id === orderId);
      const patient =
        patients.find((p) => p.id === order?.patientId) ??
        patients.find((p) => p.name === order?.patientName);
      const sampleIds = [...new Set(results.map((r) => r.sampleId))];
      const reportSamples = samples.filter((s) => sampleIds.includes(s.id));

      return {
        reportId: reportIdFromOrder(orderId),
        orderId,
        patientId: order?.patientId ?? patient?.id ?? '—',
        patientName: order?.patientName ?? patient?.name ?? 'Unknown',
        patient,
        order,
        samples: reportSamples,
        results,
        testCount: results.length,
        approvedBy: results.find((r) => r.approvedBy)?.approvedBy,
        approvedAt: latestTimestamp(results, 'approvedAt') ?? latestTimestamp(results, 'enteredAt'),
        referringDoctor: order?.referringDoctor,
      };
    })
    .sort((a, b) => (b.approvedAt ?? '').localeCompare(a.approvedAt ?? ''));
}

export function buildPatientReports(): PatientReport[] {
  return buildPatientReportsFromData({
    results: getResults(),
    orders: getOrders(),
    patients: getPatients(),
    samples: getSamples(),
  });
}

export function reportDetailCsvRows(report: PatientReport) {
  return report.results.map((result) => {
    const sample = report.samples.find((s) => s.id === result.sampleId);
    return {
      'Report ID': report.reportId,
      Patient: report.patientName,
      'Patient ID': report.patientId,
      'Order ID': report.orderId,
      'Sample ID': result.sampleId,
      Barcode: sample?.barcode ?? '',
      Test: result.testName,
      Value: result.value,
      Unit: result.unit ?? '',
      Reference: result.referenceRange ?? '',
      Critical: result.isCritical ? 'Yes' : 'No',
      'Entered By': result.enteredBy ?? '',
      'Entered At': result.enteredAt ? formatDateTime(result.enteredAt) : '',
      'Approved By': result.approvedBy ?? report.approvedBy ?? '',
      'Approved At': result.approvedAt
        ? formatDateTime(result.approvedAt)
        : report.approvedAt
          ? formatDateTime(report.approvedAt)
          : '',
    };
  });
}

export function allReportsDetailCsvRows(reports: PatientReport[]) {
  return reports.flatMap((report) => reportDetailCsvRows(report));
}
