'use client';

import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { SettingsShell } from '@/components/lims/settings/settings-shell';
import { apiJson } from '@/lib/http/client';
import type { LabGeneralSettings } from '@/lib/firestore/catalog-writes';

export default function SettingsGeneralPage() {
  const [settings, setSettings] = useState<LabGeneralSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await apiJson<{ data: LabGeneralSettings }>('/api/settings/general');
      setSettings(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settings.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    try {
      const res = await apiJson<{ data: LabGeneralSettings }>('/api/settings/general', {
        method: 'PATCH',
        body: JSON.stringify({
          laboratoryName: settings.laboratoryName,
          contactPhone: settings.contactPhone,
          email: settings.email,
          requirePathologistApproval: settings.requirePathologistApproval,
          includeDigitalSignature: settings.includeDigitalSignature,
        }),
      });
      setSettings(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <SettingsShell description="Lab profile, reports, and notification preferences">
        <p className="text-sm text-muted">{error || 'Loading settings…'}</p>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell description="Lab profile, reports, and notification preferences">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <button type="button" onClick={() => void handleSave()} className="lims-btn-primary" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="lims-card p-4">
          <h2 className="text-sm font-semibold text-slate-900">General</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Laboratory Name</label>
              <input
                className="lims-input"
                value={settings.laboratoryName}
                onChange={(e) => setSettings({ ...settings, laboratoryName: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Contact Phone</label>
              <input
                className="lims-input"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Email</label>
              <input
                type="email"
                className="lims-input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </section>
        <section className="lims-card p-4">
          <h2 className="text-sm font-semibold text-slate-900">Reports</h2>
          <div className="mt-3 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.requirePathologistApproval}
                onChange={(e) => setSettings({ ...settings, requirePathologistApproval: e.target.checked })}
                className="rounded border-muted-border"
              />
              Require pathologist approval before release
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.includeDigitalSignature}
                onChange={(e) => setSettings({ ...settings, includeDigitalSignature: e.target.checked })}
                className="rounded border-muted-border"
              />
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
              <p className="mt-1 text-muted">Download link when results are ready</p>
            </div>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
