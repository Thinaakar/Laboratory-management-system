'use client';

import { ArrowRight, ClipboardList, UserPlus } from 'lucide-react';
import { StatusBadge } from '@/components/lims/status-badge';
import type { Patient } from '@/lib/types/lims';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PatientHubProps {
  patients: Patient[];
  onRegister: () => void;
  onOpenDirectory: () => void;
}

function patientTypeVariant(type?: string): 'neutral' | 'primary' | 'warning' | 'success' {
  switch (type) {
    case 'Scheduled':
    case 'Corporate':
      return 'primary';
    case 'Insurance':
      return 'warning';
    case 'Camp':
      return 'success';
    default:
      return 'neutral';
  }
}

export function PatientHub({ patients, onRegister, onOpenDirectory }: PatientHubProps) {
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="patient-hub space-y-8">
      {/* Page header */}
      <div className="border-b border-slate-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Patient Management</p>
        <h1 className="patient-hub-heading mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Patients
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Manage patient registrations and records. Register new patients or browse the full directory.
        </p>
      </div>

      {/* Action cards */}
      <section aria-label="Patient actions">
        <h2 className="patient-hub-heading mb-4 text-sm font-semibold text-slate-900">
          Quick Actions
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="patient-hub-card flex flex-col p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus size={28} strokeWidth={1.75} />
            </div>
            <h3 className="patient-hub-heading mt-5 text-lg font-bold text-slate-900">
              Register Patient
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Add a new patient to the laboratory registry with demographics, contact details, and
              referral information.
            </p>
            <button
              type="button"
              onClick={onRegister}
              className="patient-hub-cta mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              Register Patient
              <ArrowRight size={16} />
            </button>
          </article>

          <article className="patient-hub-card flex flex-col p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A]/10 text-[#0F172A]">
              <ClipboardList size={28} strokeWidth={1.75} />
            </div>
            <h3 className="patient-hub-heading mt-5 text-lg font-bold text-slate-900">
              Patient Directory
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
              Browse, search, and review all registered patients. Sort by name, ID, type, or
              registration date.
            </p>
            <button
              type="button"
              onClick={onOpenDirectory}
              className="patient-hub-cta-secondary mt-6 inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              View Directory
              <ArrowRight size={16} />
            </button>
          </article>
        </div>
      </section>

      {/* Recent activity */}
      <section aria-label="Recent patient activity">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="patient-hub-heading text-sm font-semibold text-slate-900">
              Recent Patient Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest registrations in your laboratory</p>
          </div>
          <button
            type="button"
            onClick={onOpenDirectory}
            className="text-xs font-semibold text-primary transition-colors hover:text-primary-600"
          >
            View all →
          </button>
        </div>

        <div className="patient-hub-card overflow-hidden">
          {recentPatients.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No patients registered yet. Register your first patient to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p, i) => (
                    <tr
                      key={p.id}
                      className={cn(
                        'border-b border-slate-50 transition-colors last:border-0 hover:bg-primary/5',
                        i % 2 === 1 && 'bg-[#F8FAFC]/60',
                      )}
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900">{p.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{p.id}</td>
                      <td className="px-5 py-3.5">
                        {p.patientType ? (
                          <StatusBadge
                            label={p.patientType}
                            variant={patientTypeVariant(p.patientType)}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{p.phone}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDateTime(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
