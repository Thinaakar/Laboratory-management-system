import { apiJson } from '@/lib/http/client';
import type { AnalyticsPeriod, AnalyticsSnapshot } from '@/lib/data/analytics';
import type { PatientReport } from '@/lib/data/reports';
import type {
  Appointment,
  DashboardKpis,
  Invoice,
  LabOrder,
  Patient,
  Sample,
  TestResult,
} from '@/lib/types/lims';
import type { DbRole, PublicUser } from '@/lib/data/db-types';
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
  userCreateSchema,
  userUpdateSchema,
  roleCreateSchema,
  roleUpdateSchema,
} from '@/lib/validation/entities';

async function getData<T>(path: string): Promise<T> {
  const res = await apiJson<{ data: T }>(path);
  return res.data;
}

async function sendData<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await apiJson<{ data: T }>(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res.data;
}

export const limsApi = {
  patients: {
    list: () => getData<Patient[]>('/api/patients'),
    create: (body: z.infer<typeof patientCreateSchema>) =>
      sendData<Patient>('/api/patients', 'POST', body),
    update: (id: string, body: z.infer<typeof patientCreateSchema>) =>
      sendData<Patient>(`/api/patients/${id}`, 'PATCH', body),
    remove: (id: string) => sendData<{ ok: true }>(`/api/patients/${id}`, 'DELETE'),
  },
  appointments: {
    list: () => getData<Appointment[]>('/api/appointments'),
    create: (body: z.infer<typeof appointmentCreateSchema>) =>
      sendData<{ booking: Appointment; order: LabOrder; invoice: Invoice }>(
        '/api/appointments',
        'POST',
        body,
      ),
    update: (id: string, body: z.infer<typeof appointmentUpdateSchema>) =>
      sendData<Appointment>(`/api/appointments/${id}`, 'PATCH', body),
    remove: (id: string) => sendData<{ ok: true }>(`/api/appointments/${id}`, 'DELETE'),
  },
  orders: {
    list: () => getData<LabOrder[]>('/api/orders'),
  },
  invoices: {
    list: () => getData<Invoice[]>('/api/invoices'),
    recordPayment: (id: string, body: z.infer<typeof invoicePaymentSchema>) =>
      sendData<Invoice>(`/api/invoices/${id}/payment`, 'POST', body),
  },
  samples: {
    list: () => getData<Sample[]>('/api/samples'),
    nextBarcode: () => getData<{ barcode: string }>('/api/samples/next-barcode'),
    create: (body: z.infer<typeof sampleCreateSchema>) =>
      sendData<Sample>('/api/samples', 'POST', body),
    update: (id: string, body: z.infer<typeof sampleUpdateSchema>) =>
      sendData<Sample>(`/api/samples/${id}`, 'PATCH', body),
    remove: (id: string) => sendData<{ ok: true }>(`/api/samples/${id}`, 'DELETE'),
  },
  results: {
    list: () => getData<TestResult[]>('/api/results'),
    enter: (body: z.infer<typeof resultEnterSchema>) =>
      sendData<TestResult>('/api/results', 'POST', body),
    approve: (id: string) => sendData<TestResult>(`/api/results/${id}/approve`, 'POST'),
    reject: (id: string, body?: z.infer<typeof resultRejectSchema>) =>
      sendData<TestResult>(`/api/results/${id}/reject`, 'POST', body ?? {}),
  },
  reports: {
    list: () => getData<PatientReport[]>('/api/reports'),
  },
  analytics: {
    snapshot: (period: AnalyticsPeriod = 'overall') =>
      getData<AnalyticsSnapshot>(`/api/analytics?period=${period}`),
  },
  dashboard: {
    kpis: () => getData<DashboardKpis>('/api/dashboard/kpis'),
  },
  catalog: {
    tests: () => getData<import('@/lib/types/lims').LabTest[]>('/api/tests'),
    packages: () => getData<import('@/lib/types/lims').HealthPackage[]>('/api/packages'),
    referrals: () => getData<import('@/lib/types/lims').DoctorReferral[]>('/api/referrals'),
  },
  users: {
    list: () => getData<PublicUser[]>('/api/users'),
    create: (body: z.infer<typeof userCreateSchema>) =>
      sendData<PublicUser>('/api/users', 'POST', body),
    update: (id: string, body: z.infer<typeof userUpdateSchema>) =>
      sendData<PublicUser>(`/api/users/${id}`, 'PATCH', body),
    remove: (id: string) => sendData<{ ok: true }>(`/api/users/${id}`, 'DELETE'),
  },
  roles: {
    list: () => getData<DbRole[]>('/api/roles'),
    create: (body: z.infer<typeof roleCreateSchema>) =>
      sendData<DbRole>('/api/roles', 'POST', body),
    update: (id: string, body: z.infer<typeof roleUpdateSchema>) =>
      sendData<DbRole>(`/api/roles/${id}`, 'PATCH', body),
    updatePermissions: (id: string, permissions: string[]) =>
      sendData<DbRole>(`/api/roles/${id}`, 'PATCH', { permissions }),
    remove: (id: string) => sendData<{ ok: true }>(`/api/roles/${id}`, 'DELETE'),
  },
};

export async function isApiMode(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    const body = (await res.json()) as { firebase?: string };
    return body.firebase === 'connected';
  } catch {
    return false;
  }
}
