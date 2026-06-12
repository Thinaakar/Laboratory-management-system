'use client';

import { SettingsShell } from '@/components/lims/settings/settings-shell';

export default function SettingsGeneralPage() {
  return (
    <SettingsShell description="Laboratory profile and system preferences">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="lims-card p-4">
          <h2 className="text-sm font-semibold text-slate-900">General</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Laboratory Name</label>
              <input className="lims-input" defaultValue="LabCore Diagnostic Center" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Contact Phone</label>
              <input className="lims-input" defaultValue="+91 22 4000 1234" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Email</label>
              <input className="lims-input" defaultValue="info@labcore.io" />
            </div>
          </div>
        </section>
        <section className="lims-card p-4">
          <h2 className="text-sm font-semibold text-slate-900">Reports</h2>
          <div className="mt-3 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-muted-border" />
              Enable QR verification on reports
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-muted-border" />
              Require pathologist approval before release
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded border-muted-border" />
              Include digital signature on PDF
            </label>
          </div>
        </section>
        <section className="lims-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
          <p className="mt-2 text-sm text-muted">
            Configure email, SMS, and WhatsApp templates for registration, invoice, and report-ready
            triggers.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-muted-border p-3 text-sm">
              <p className="font-medium text-slate-900">Registration</p>
              <p className="mt-1 text-muted">Patient welcome + visit summary</p>
            </div>
            <div className="rounded border border-muted-border p-3 text-sm">
              <p className="font-medium text-slate-900">Invoice</p>
              <p className="mt-1 text-muted">Payment receipt and balance due</p>
            </div>
            <div className="rounded border border-muted-border p-3 text-sm">
              <p className="font-medium text-slate-900">Report Ready</p>
              <p className="mt-1 text-muted">Download link with QR verification</p>
            </div>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
