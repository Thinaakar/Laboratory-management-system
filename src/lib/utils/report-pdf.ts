import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { PatientReport } from '@/lib/data/reports';
import { calculateAgeFromDob } from '@/lib/data/patients-store';
import { formatDate, formatDateTime } from '@/lib/utils';

export interface ReportPdfOptions {
  laboratoryName?: string;
  includeQr?: boolean;
  includeSignature?: boolean;
}

function reportVerifyUrl(reportId: string): string {
  if (typeof window === 'undefined') return reportId;
  return `${window.location.origin}/reports?verify=${encodeURIComponent(reportId)}`;
}

export async function downloadReportPdf(
  report: PatientReport,
  options: ReportPdfOptions = {},
): Promise<void> {
  const {
    laboratoryName = 'LabCore Diagnostic Center',
    includeQr = true,
    includeSignature = true,
  } = options;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  const addLine = (text: string, size = 10, style: 'normal' | 'bold' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size * 0.45 + 2;
    }
  };

  doc.setTextColor(15, 23, 42);
  addLine(laboratoryName, 16, 'bold');
  addLine('Laboratory Test Report', 11, 'normal');
  doc.setTextColor(100, 116, 139);
  addLine(`Report ID: ${report.reportId}`, 9);
  addLine(`Generated: ${formatDateTime(new Date().toISOString())}`, 9);
  y += 2;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setTextColor(15, 23, 42);
  addLine('Patient Information', 11, 'bold');
  const patientAge = report.patient?.dateOfBirth
    ? calculateAgeFromDob(report.patient.dateOfBirth)
    : undefined;
  addLine(`Name: ${report.patientName}`, 10);
  addLine(`Patient ID: ${report.patientId}`, 10);
  if (report.patient?.gender) addLine(`Gender: ${report.patient.gender}`, 10);
  if (patientAge != null) addLine(`Age: ${patientAge} years`, 10);
  if (report.patient?.phone) addLine(`Phone: ${report.patient.phone}`, 10);
  y += 2;

  addLine('Order & Sample', 11, 'bold');
  addLine(`Order ID: ${report.orderId}`, 10);
  addLine(`Referring Doctor: ${report.referringDoctor ?? 'None'}`, 10);
  if (report.samples[0]) {
    addLine(`Sample ID: ${report.samples[0].id}`, 10);
    addLine(`Barcode: ${report.samples[0].barcode}`, 10);
    if (report.samples[0].collectedAt) {
      addLine(`Collected: ${formatDateTime(report.samples[0].collectedAt)}`, 10);
    }
  }
  y += 4;

  addLine(`Test Results (${report.testCount})`, 11, 'bold');
  y += 1;

  const colX = [margin, margin + 52, margin + 88, margin + 118, margin + 148];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Test', colX[0], y);
  doc.text('Value', colX[1], y);
  doc.text('Reference', colX[2], y);
  doc.text('Critical', colX[3], y);
  doc.text('Entered', colX[4], y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  for (const result of report.results) {
    if (y > 265) {
      doc.addPage();
      y = margin;
    }
    const value = `${result.value}${result.unit ? ` ${result.unit}` : ''}`;
    doc.text(result.testName.slice(0, 28), colX[0], y);
    doc.text(value.slice(0, 18), colX[1], y);
    doc.text((result.referenceRange ?? '—').slice(0, 16), colX[2], y);
    doc.text(result.isCritical ? 'Yes' : '—', colX[3], y);
    doc.text(result.enteredAt ? formatDate(result.enteredAt) : '—', colX[4], y);
    y += 5;
  }

  const notes = report.results.find((r) => r.pathologistNotes)?.pathologistNotes;
  if (notes) {
    y += 3;
    addLine('Pathologist Notes', 10, 'bold');
    addLine(notes, 9);
  }

  if (includeSignature && report.approvedBy) {
    y += 4;
    addLine(`Approved by: ${report.approvedBy}`, 10);
    if (report.approvedAt) addLine(`Approved: ${formatDateTime(report.approvedAt)}`, 9);
    addLine('Digitally signed — LabCore LIMS', 8);
  }

  if (includeQr) {
    const qrDataUrl = await QRCode.toDataURL(reportVerifyUrl(report.reportId), {
      width: 200,
      margin: 1,
    });
    const qrSize = 28;
    const qrX = pageWidth - margin - qrSize;
    const qrY = doc.internal.pageSize.getHeight() - margin - qrSize - 8;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Scan to verify report', qrX, qrY + qrSize + 4);
  }

  doc.save(`${report.reportId}.pdf`);
}

export async function qrDataUrlForReport(reportId: string): Promise<string> {
  return QRCode.toDataURL(reportVerifyUrl(reportId), { width: 160, margin: 1 });
}
