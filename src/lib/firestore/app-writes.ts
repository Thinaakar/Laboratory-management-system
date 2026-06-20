import type { SessionPayload } from '@/lib/auth/session';
import { calculateAgeFromDob } from '@/lib/data/patients-store';
import type {
  Appointment,
  Invoice,
  LabOrder,
  MarketingLead,
  Patient,
  Sample,
  TestResult,
} from '@/lib/types/lims';
import type { z } from 'zod';
import type {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  invoiceCreateSchema,
  invoicePaymentSchema,
  leadCreateSchema,
  orderCreateSchema,
  orderUpdateSchema,
  patientCreateSchema,
  resultEnterSchema,
  resultRejectSchema,
  resultUpdateSchema,
  sampleCreateSchema,
  sampleUpdateSchema,
} from '@/lib/validation/entities';
import {
  deleteDoc,
  nextAppointmentId,
  nextBarcode,
  nextInvoiceId,
  nextOrderId,
  nextSampleId,
  nextSequentialId,
  setDoc,
  withoutUndefined,
} from '@/lib/firestore/helpers';
import {
  getAppointment,
  getInvoice,
  getOrder,
  getPatient,
  getResult,
  getSample,
} from '@/lib/firestore/app-data';

async function writeAudit(
  session: SessionPayload,
  entry: { action: string; module: string; details?: string },
) {
  const id = `AUD-${Date.now()}`;
  await setDoc('audit_logs', id, {
    id,
    userId: session.userId,
    userName: session.name,
    action: entry.action,
    module: entry.module,
    details: entry.details,
    timestamp: new Date().toISOString(),
  });
}

export async function seedDocument(table: string, id: string, data: Record<string, unknown>) {
  await setDoc(table, id, data);
}

export async function createPatient(
  input: z.infer<typeof patientCreateSchema>,
  session?: SessionPayload,
): Promise<Patient> {
  const id = await nextSequentialId('patients', 'PAT');
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const dateOfBirth = input.dateOfBirth;
  const patient: Patient = {
    id,
    firstName,
    lastName: lastName || undefined,
    name,
    phone: input.phone.trim(),
    bloodGroup: input.bloodGroup,
    dateOfBirth,
    age: calculateAgeFromDob(dateOfBirth),
    gender: input.gender,
    address: input.address.trim(),
    referredDoctor: input.referredDoctor?.trim(),
    patientType: input.patientType,
    branchId: input.branchId,
    createdAt: new Date().toISOString(),
  };
  await setDoc('patients', id, patient as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'CREATE',
      module: 'patients',
      details: `Registered ${patient.id} — ${patient.name}`,
    });
  }
  return patient;
}

export async function updatePatientDb(
  id: string,
  input: z.infer<typeof patientCreateSchema>,
  session?: SessionPayload,
): Promise<Patient> {
  const existing = await getPatient(id);
  if (!existing) throw new Error('Patient not found.');
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const dateOfBirth = input.dateOfBirth;
  const updated: Patient = {
    ...existing,
    firstName,
    lastName: lastName || undefined,
    name,
    phone: input.phone.trim(),
    bloodGroup: input.bloodGroup,
    dateOfBirth,
    age: calculateAgeFromDob(dateOfBirth),
    gender: input.gender,
    address: input.address.trim(),
    referredDoctor: input.referredDoctor?.trim(),
    patientType: input.patientType,
    branchId: input.branchId,
  };
  await setDoc('patients', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'patients',
      details: `Updated ${updated.id} — ${updated.name}`,
    });
  }
  return updated;
}

export async function deletePatientDb(id: string, session?: SessionPayload): Promise<void> {
  const existing = await getPatient(id);
  if (!existing) throw new Error('Patient not found.');
  await deleteDoc('patients', id);
  if (session) {
    await writeAudit(session, {
      action: 'DELETE',
      module: 'patients',
      details: `Deleted ${existing.id} — ${existing.name}`,
    });
  }
}

export async function createLead(input: z.infer<typeof leadCreateSchema>): Promise<MarketingLead> {
  const id = await nextSequentialId('leads', 'LEAD', 4);
  const lead: MarketingLead = {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim(),
    organization: input.organization?.trim(),
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  await setDoc('leads', id, lead as unknown as Record<string, unknown>);
  return lead;
}

export async function createOrder(
  input: z.infer<typeof orderCreateSchema>,
  session?: SessionPayload,
): Promise<LabOrder> {
  const id = await nextOrderId();
  const order: LabOrder = {
    id,
    branchId: input.branchId,
    patientId: input.patientId,
    patientName: input.patientName,
    testIds: input.testIds,
    testNames: input.testNames,
    status: 'Pending',
    totalAmount: input.totalAmount,
    gstPercent: 0,
    referringDoctor: input.referringDoctor,
    priority: input.priority ?? 'Normal',
    healthPackageId: input.healthPackageId,
    healthPackageName: input.healthPackageName,
    createdAt: new Date().toISOString(),
    createdBy: session?.name,
  };
  await setDoc('orders', id, order as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'CREATE',
      module: 'orders',
      details: `Created order ${order.id} for ${order.patientName}`,
    });
  }
  return order;
}

export async function updateOrderDb(
  id: string,
  input: z.infer<typeof orderUpdateSchema>,
  session?: SessionPayload,
): Promise<LabOrder> {
  const existing = await getOrder(id);
  if (!existing) throw new Error('Order not found.');
  const updated: LabOrder = { ...existing, ...withoutUndefined(input as Record<string, unknown>) };
  await setDoc('orders', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'orders',
      details: `Updated order ${updated.id}`,
    });
  }
  return updated;
}

export async function createInvoice(
  input: z.infer<typeof invoiceCreateSchema>,
  session?: SessionPayload,
): Promise<Invoice> {
  const id = await nextInvoiceId();
  const invoice: Invoice = {
    id,
    orderId: input.orderId,
    patientId: input.patientId,
    patientName: input.patientName,
    amount: input.amount,
    paidAmount: 0,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  await setDoc('invoices', id, invoice as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'CREATE',
      module: 'billing',
      details: `Created invoice ${invoice.id} for ${invoice.patientName}`,
    });
  }
  return invoice;
}

export async function recordInvoicePayment(
  id: string,
  input: z.infer<typeof invoicePaymentSchema>,
  session?: SessionPayload,
): Promise<Invoice> {
  const existing = await getInvoice(id);
  if (!existing) throw new Error('Invoice not found.');
  const due = existing.amount - existing.paidAmount;
  if (input.amount > due + 0.001) throw new Error('Payment exceeds outstanding balance.');
  const paidAmount = existing.paidAmount + input.amount;
  const status =
    paidAmount >= existing.amount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';
  const updated: Invoice = {
    ...existing,
    paidAmount,
    status,
    paymentMethod: input.paymentMethod,
  };
  await setDoc('invoices', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'billing',
      details: `Recorded ${input.paymentMethod} payment of ₹${input.amount} for ${existing.id}`,
    });
  }
  return updated;
}

export async function createAppointmentBooking(
  input: z.infer<typeof appointmentCreateSchema>,
  session?: SessionPayload,
): Promise<{ booking: Appointment; order: LabOrder; invoice: Invoice }> {
  if (!input.packageSelection) throw new Error('Health package selection is required.');
  if (!input.testIds.length) throw new Error('Select at least one test.');

  const order = await createOrder(
    {
      patientId: input.patientId,
      patientName: input.patientName,
      testIds: input.testIds,
      testNames: input.testNames,
      totalAmount: input.orderTotal,
      referringDoctor: input.referringDoctor,
      priority: input.priority,
      healthPackageId:
        input.packageSelection !== 'none' ? input.healthPackageId : undefined,
      healthPackageName:
        input.packageSelection !== 'none' ? input.healthPackageName : undefined,
    },
    session,
  );

  const invoice = await createInvoice(
    {
      orderId: order.id,
      patientId: input.patientId,
      patientName: input.patientName,
      amount: input.orderTotal,
    },
    session,
  );

  const aptId = await nextAppointmentId();
  const booking: Appointment = {
    id: aptId,
    patientId: input.patientId,
    patientName: input.patientName,
    scheduledAt: input.scheduledAt,
    type: input.type,
    status: 'Scheduled',
    notes: input.notes?.trim(),
    referringDoctor: input.referringDoctor,
    priority: input.priority ?? 'Normal',
    healthPackageId: input.packageSelection !== 'none' ? input.healthPackageId : undefined,
    healthPackageName: input.packageSelection !== 'none' ? input.healthPackageName : undefined,
    orderId: order.id,
    testIds: input.testIds,
    testNames: input.testNames,
    orderTotal: input.orderTotal,
  };
  await setDoc('appointments', aptId, booking as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'CREATE',
      module: 'appointments',
      details: `Scheduled ${booking.id} for ${booking.patientName}`,
    });
  }
  return { booking, order, invoice };
}

export async function updateAppointmentDb(
  id: string,
  input: z.infer<typeof appointmentUpdateSchema>,
  session?: SessionPayload,
): Promise<Appointment> {
  const existing = await getAppointment(id);
  if (!existing) throw new Error('Appointment not found.');
  const updated: Appointment = {
    ...existing,
    ...withoutUndefined({
      ...input,
      notes: input.notes !== undefined ? input.notes.trim() || undefined : undefined,
    } as Record<string, unknown>),
  };
  await setDoc('appointments', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'appointments',
      details: `Updated ${updated.id} for ${updated.patientName}`,
    });
  }
  return updated;
}

export async function deleteAppointmentDb(id: string, session?: SessionPayload): Promise<void> {
  const apt = await getAppointment(id);
  if (!apt) throw new Error('Appointment not found.');
  await deleteDoc('appointments', id);
  if (session) {
    await writeAudit(session, {
      action: 'DELETE',
      module: 'appointments',
      details: `Deleted ${apt.id} for ${apt.patientName}`,
    });
  }
}

export async function createSample(
  input: z.infer<typeof sampleCreateSchema>,
  session?: SessionPayload,
): Promise<Sample> {
  const order = await getOrder(input.orderId);
  if (!order) throw new Error('Order not found.');
  const id = await nextSampleId();
  const collectedAt = new Date(input.collectedAt).toISOString();
  const sample: Sample = {
    id,
    orderId: input.orderId,
    patientId: order.patientId,
    patientName: order.patientName,
    barcode: input.barcode.trim(),
    sampleType: input.sampleType,
    status: 'Collected',
    collectedAt,
    createdAt: new Date().toISOString(),
  };
  await setDoc('samples', id, sample as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'CREATE',
      module: 'samples',
      details: `Registered sample ${sample.barcode} for order ${sample.orderId}`,
    });
  }
  return sample;
}

export async function updateSampleDb(
  id: string,
  input: z.infer<typeof sampleUpdateSchema>,
  session?: SessionPayload,
): Promise<Sample> {
  const existing = await getSample(id);
  if (!existing) throw new Error('Sample not found.');
  const updated: Sample = {
    ...existing,
    sampleType: input.sampleType,
    status: input.status,
    collectedAt: input.collectedAt
      ? new Date(input.collectedAt).toISOString()
      : existing.collectedAt,
    rejectionReason: input.rejectionReason,
  };
  await setDoc('samples', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'samples',
      details: `Updated sample ${updated.id} (${updated.barcode})`,
    });
  }
  return updated;
}

export async function deleteSampleDb(id: string, session?: SessionPayload): Promise<void> {
  const existing = await getSample(id);
  if (!existing) throw new Error('Sample not found.');
  await deleteDoc('samples', id);
  if (session) {
    await writeAudit(session, {
      action: 'DELETE',
      module: 'samples',
      details: `Deleted sample ${existing.id}`,
    });
  }
}

export async function enterResult(
  input: z.infer<typeof resultEnterSchema>,
  session?: SessionPayload,
): Promise<TestResult> {
  const existing = await getResult(input.resultId);
  if (!existing) throw new Error('Result not found.');
  const updated: TestResult = {
    ...existing,
    value: input.value.trim(),
    unit: input.unit?.trim() || existing.unit,
    isCritical: input.isCritical ?? false,
    queueStatus: 'Completed',
    enteredBy: session?.name ?? existing.enteredBy,
    enteredAt: new Date().toISOString(),
    approvalStatus: 'Pending',
  };
  await setDoc('results', input.resultId, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'results',
      details: `Entered result for ${updated.testName}: ${updated.value}`,
    });
  }
  return updated;
}

export async function updateResultDb(
  id: string,
  input: z.infer<typeof resultUpdateSchema>,
  session?: SessionPayload,
): Promise<TestResult> {
  const existing = await getResult(id);
  if (!existing) throw new Error('Result not found.');
  const updated: TestResult = {
    ...existing,
    value: input.value.trim(),
    unit: input.unit?.trim() || existing.unit,
    isCritical: input.isCritical ?? existing.isCritical,
    queueStatus: input.queueStatus ?? existing.queueStatus,
  };
  await setDoc('results', id, updated as unknown as Record<string, unknown>);
  if (session) {
    await writeAudit(session, {
      action: 'UPDATE',
      module: 'results',
      details: `Revised result ${updated.id}`,
    });
  }
  return updated;
}

export async function approveResult(
  id: string,
  session: SessionPayload,
): Promise<TestResult> {
  const existing = await getResult(id);
  if (!existing) throw new Error('Result not found.');
  const updated: TestResult = {
    ...existing,
    approvalStatus: 'Approved',
    approvedBy: session.name,
    approvedAt: new Date().toISOString(),
  };
  await setDoc('results', id, updated as unknown as Record<string, unknown>);
  await writeAudit(session, {
    action: 'APPROVE',
    module: 'reports',
    details: `Approved result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}

export async function rejectResult(
  id: string,
  input: z.infer<typeof resultRejectSchema>,
  session: SessionPayload,
): Promise<TestResult> {
  const existing = await getResult(id);
  if (!existing) throw new Error('Result not found.');
  const updated: TestResult = {
    ...existing,
    approvalStatus: 'Rejected',
    pathologistNotes: input.pathologistNotes,
    approvedBy: session.name,
    approvedAt: new Date().toISOString(),
  };
  await setDoc('results', id, updated as unknown as Record<string, unknown>);
  await writeAudit(session, {
    action: 'REJECT',
    module: 'reports',
    details: `Rejected result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}

export async function getNextBarcodeFromDb(): Promise<string> {
  return nextBarcode();
}

export async function getNextPatientIdFromDb(): Promise<string> {
  return nextSequentialId('patients', 'PAT', 6, /^PAT-(\d+)$/);
}
