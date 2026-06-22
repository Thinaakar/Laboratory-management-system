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
import type { DbUser } from '@/lib/data/db-types';
import type { DbRole } from '@/lib/data/db-types';
import { INITIAL_ADMIN } from '@/lib/data/db-types';
import { SUPER_ADMIN_ROLE_ID, isSuperAdminRole } from '@/lib/data/roles-store';
import { hashPassword } from '@/lib/auth/password-server';
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
  userCreateSchema,
  userUpdateSchema,
  roleCreateSchema,
  roleUpdateSchema,
  rolePermissionsSchema,
} from '@/lib/validation/entities';
import {
  deleteDoc,
  nextAppointmentId,
  nextBarcode,
  nextInvoiceId,
  nextOrderId,
  nextResultId,
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
  getUserByEmail,
  getUserById,
  getUserByUsername,
  getRoleById,
  getRoleByName,
  listUsers,
  listResults,
  listTests,
  toPublicUser,
} from '@/lib/firestore/app-data';

export async function writeAuditEntry(
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
  await ensureResultsForOrderSample(order, sample, session);
  if (session) {
    await writeAuditEntry(session, {
      action: 'CREATE',
      module: 'samples',
      details: `Registered sample ${sample.barcode} for order ${sample.orderId}`,
    });
  }
  return sample;
}

async function ensureResultsForOrderSample(
  order: LabOrder,
  sample: Sample,
  session?: SessionPayload,
): Promise<void> {
  const [existingResults, tests] = await Promise.all([listResults(), listTests()]);
  const covered = new Set(
    existingResults.filter((r) => r.orderId === order.id).map((r) => r.testId),
  );

  for (let i = 0; i < order.testIds.length; i++) {
    const testId = order.testIds[i];
    const testName = order.testNames[i] ?? testId;
    if (covered.has(testId)) continue;

    const catalogTest = tests.find((t) => t.id === testId);
    const resultId = await nextResultId();
    const result: TestResult = {
      id: resultId,
      sampleId: sample.id,
      orderId: order.id,
      testId,
      testName,
      value: '—',
      unit: catalogTest?.unit,
      referenceRange: catalogTest?.referenceRange,
      queueStatus: 'Pending',
      approvalStatus: 'Pending',
      enteredBy: session?.name,
      enteredAt: new Date().toISOString(),
    };
    await setDoc('results', resultId, result as unknown as Record<string, unknown>);
    covered.add(testId);
  }
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
    await writeAuditEntry(session, {
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
  await writeAuditEntry(session, {
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
  await writeAuditEntry(session, {
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

export async function createUserDb(
  input: z.infer<typeof userCreateSchema>,
  session: SessionPayload,
) {
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  if (await getUserByEmail(email)) {
    throw new Error('A user with this email already exists.');
  }
  if (await getUserByUsername(username)) {
    throw new Error('This username is already taken.');
  }
  const id = await nextSequentialId('users', 'USR', 6, /^USR-(\d+)$/);
  const user: DbUser = {
    id,
    displayName: input.displayName.trim(),
    email,
    mobile: input.mobile.trim(),
    username,
    passwordHash: hashPassword(input.password),
    role: input.role,
    branchId: input.branchId,
    department: input.department ?? 'Administration',
    status: input.status,
    createdAt: new Date().toISOString(),
  };
  await setDoc('users', id, user as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'CREATE',
    module: 'users',
    details: `Created user ${user.displayName} (${user.username})`,
  });
  return toPublicUser(user);
}

export async function updateUserDb(
  id: string,
  input: z.infer<typeof userUpdateSchema>,
  session: SessionPayload,
) {
  const existing = await getUserById(id);
  if (!existing) throw new Error('User not found.');

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const duplicateEmail = await getUserByEmail(email);
  if (duplicateEmail && duplicateEmail.id !== id) {
    throw new Error('A user with this email already exists.');
  }
  const duplicateUsername = await getUserByUsername(username);
  if (duplicateUsername && duplicateUsername.id !== id) {
    throw new Error('This username is already taken.');
  }

  const updated: DbUser = {
    ...existing,
    displayName: input.displayName.trim(),
    email,
    mobile: input.mobile.trim(),
    username,
    role: input.role,
    branchId: input.branchId ?? existing.branchId,
    department: input.department ?? existing.department,
    status: input.status,
    passwordHash: input.password ? hashPassword(input.password) : existing.passwordHash,
  };
  await setDoc('users', id, updated as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'UPDATE',
    module: 'users',
    details: `Updated user ${updated.displayName} (${updated.username})`,
  });
  return toPublicUser(updated);
}

export async function deleteUserDb(id: string, session: SessionPayload): Promise<void> {
  if (id === INITIAL_ADMIN.id) {
    throw new Error('Cannot delete the system admin account.');
  }
  const existing = await getUserById(id);
  if (!existing) throw new Error('User not found.');
  await deleteDoc('users', id);
  await writeAuditEntry(session, {
    action: 'DELETE',
    module: 'users',
    details: `Deleted user ${existing.displayName} (${existing.email})`,
  });
}

export async function createRoleDb(
  input: z.infer<typeof roleCreateSchema>,
  session: SessionPayload,
): Promise<DbRole> {
  const label = input.label.trim();
  const existing = await getRoleByName(label);
  if (existing) throw new Error('A role with this name already exists.');

  const id = `role-${Date.now()}`;
  const role: DbRole = {
    id,
    name: label,
    label,
    description: input.description.trim(),
    permissions: [...input.permissions],
    color: input.color,
    status: input.status,
    isSystem: false,
  };
  await setDoc('roles', id, role as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'CREATE',
    module: 'roles',
    details: `Created role ${role.label}`,
  });
  return role;
}

export async function updateRoleDb(
  id: string,
  input: z.infer<typeof roleUpdateSchema>,
  session: SessionPayload,
): Promise<DbRole> {
  const existing = await getRoleById(id);
  if (!existing) throw new Error('Role not found.');

  const label = input.label.trim();
  const duplicate = await getRoleByName(label);
  if (duplicate && duplicate.id !== id) {
    throw new Error('A role with this name already exists.');
  }

  const updated: DbRole = {
    ...existing,
    label,
    name: existing.isSystem ? existing.name : label,
    description: input.description.trim(),
    color: input.color,
    status: input.status,
  };
  await setDoc('roles', id, updated as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'UPDATE',
    module: 'roles',
    details: `Updated role ${updated.label}`,
  });
  return updated;
}

export async function updateRolePermissionsDb(
  id: string,
  input: z.infer<typeof rolePermissionsSchema>,
  session: SessionPayload,
): Promise<DbRole> {
  const existing = await getRoleById(id);
  if (!existing) throw new Error('Role not found.');

  const updated: DbRole = {
    ...existing,
    permissions: [...input.permissions],
  };
  await setDoc('roles', id, updated as unknown as Record<string, unknown>);
  await writeAuditEntry(session, {
    action: 'UPDATE',
    module: 'roles',
    details: `Updated permissions for role ${updated.label}`,
  });
  return updated;
}

export async function deleteRoleDb(id: string, session: SessionPayload): Promise<void> {
  const existing = await getRoleById(id);
  if (!existing) throw new Error('Role not found.');
  if (isSuperAdminRole(existing) || id === SUPER_ADMIN_ROLE_ID) {
    throw new Error('Cannot delete the system admin role.');
  }

  const users = await listUsers();
  const assigned = users.filter((u) => u.role === existing.name || u.role === existing.label).length;
  if (assigned > 0) {
    throw new Error('Cannot delete: users are assigned to this role.');
  }

  await deleteDoc('roles', id);
  await writeAuditEntry(session, {
    action: 'DELETE',
    module: 'roles',
    details: `Deleted role ${existing.label}`,
  });
}
