import {
  addBooking,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from '@/lib/data/appointments-store';
import {
  addInvoice,
  addOrder,
  getInvoices,
  getOrders,
  recordInvoicePayment,
} from '@/lib/data/orders-store';
import {
  addPatient,
  deletePatient,
  getPatients,
  updatePatient,
} from '@/lib/data/patients-store';
import {
  approveResultLocal,
  enterResultLocal,
  getResults,
  rejectResultLocal,
} from '@/lib/data/results-store';
import {
  addSample,
  deleteSample,
  getNextBarcode,
  getSamples,
  updateSample,
} from '@/lib/data/samples-store';
import { getPackages, getReferrals, getTests } from '@/lib/data/store';
import { buildPatientReports } from '@/lib/data/reports';
import { getAnalyticsSnapshot } from '@/lib/data/analytics';
import type { z } from 'zod';
import type {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  invoicePaymentSchema,
  patientCreateSchema,
  resultEnterSchema,
  resultRejectSchema,
  sampleCreateSchema,
  sampleUpdateSchema,
} from '@/lib/validation/entities';
import type { AnalyticsPeriod } from '@/lib/data/analytics';

export const localApi = {
  patients: {
    list: () => Promise.resolve(getPatients()),
    create: (body: z.infer<typeof patientCreateSchema>) => Promise.resolve(addPatient(body)),
    update: (id: string, body: z.infer<typeof patientCreateSchema>) =>
      Promise.resolve(updatePatient(id, body)),
    remove: (id: string) => {
      deletePatient(id);
      return Promise.resolve({ ok: true as const });
    },
  },
  appointments: {
    list: () => Promise.resolve(getAppointments()),
    create: (body: z.infer<typeof appointmentCreateSchema>) => {
      const order = addOrder({
        patientId: body.patientId,
        patientName: body.patientName,
        testIds: body.testIds,
        testNames: body.testNames,
        totalAmount: body.orderTotal,
        referringDoctor: body.referringDoctor,
        priority: body.priority,
        healthPackageId: body.packageSelection !== 'none' ? body.healthPackageId : undefined,
        healthPackageName: body.packageSelection !== 'none' ? body.healthPackageName : undefined,
      });
      const invoice = addInvoice({
        orderId: order.id,
        patientId: body.patientId,
        patientName: body.patientName,
        amount: body.orderTotal,
      });
      const booking = addBooking({
        patientId: body.patientId,
        patientName: body.patientName,
        scheduledAt: body.scheduledAt,
        type: body.type,
        notes: body.notes,
        referringDoctor: body.referringDoctor,
        priority: body.priority,
        healthPackageId: body.packageSelection !== 'none' ? body.healthPackageId : undefined,
        healthPackageName: body.packageSelection !== 'none' ? body.healthPackageName : undefined,
        orderId: order.id,
        testIds: body.testIds,
        testNames: body.testNames,
        orderTotal: body.orderTotal,
      });
      return Promise.resolve({ booking, order, invoice });
    },
    update: (id: string, body: z.infer<typeof appointmentUpdateSchema>) =>
      Promise.resolve(updateAppointment(id, body)),
    remove: (id: string) => {
      deleteAppointment(id);
      return Promise.resolve({ ok: true as const });
    },
  },
  orders: {
    list: () => Promise.resolve(getOrders()),
  },
  invoices: {
    list: () => Promise.resolve(getInvoices()),
    recordPayment: (id: string, body: z.infer<typeof invoicePaymentSchema>) =>
      Promise.resolve(
        recordInvoicePayment({
          invoiceId: id,
          amount: body.amount,
          paymentMethod: body.paymentMethod,
        }),
      ),
  },
  samples: {
    list: () => Promise.resolve(getSamples()),
    nextBarcode: () => Promise.resolve({ barcode: getNextBarcode() }),
    create: (body: z.infer<typeof sampleCreateSchema>) => Promise.resolve(addSample(body)),
    update: (id: string, body: z.infer<typeof sampleUpdateSchema>) =>
      Promise.resolve(updateSample(id, body)),
    remove: (id: string) => {
      deleteSample(id);
      return Promise.resolve({ ok: true as const });
    },
  },
  results: {
    list: () => Promise.resolve(getResults()),
    enter: (body: z.infer<typeof resultEnterSchema>) =>
      Promise.resolve(enterResultLocal(body)),
    approve: (id: string, approvedBy = 'Pathologist') =>
      Promise.resolve(approveResultLocal(id, approvedBy)),
    reject: (id: string, body?: z.infer<typeof resultRejectSchema>, approvedBy = 'Pathologist') =>
      Promise.resolve(rejectResultLocal(id, approvedBy, body?.pathologistNotes)),
  },
  reports: {
    list: () => Promise.resolve(buildPatientReports()),
  },
  analytics: {
    snapshot: (period: AnalyticsPeriod = 'overall') =>
      Promise.resolve(getAnalyticsSnapshot(period)),
  },
  catalog: {
    tests: () => Promise.resolve(getTests()),
    packages: () => Promise.resolve(getPackages()),
    referrals: () => Promise.resolve(getReferrals()),
  },
};
