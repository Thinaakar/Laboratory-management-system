'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { TestResult } from '@/lib/types/lims';

interface EnterResultsModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function EnterResultsModal({ onClose, onSaved }: EnterResultsModalProps) {
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [resultId, setResultId] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [critical, setCritical] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const api = await getLimsData();
      const list = await api.results.list();
      if (!active) return;
      setResults(list);
      setResultId(list[0]?.id ?? '');
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resultId) {
      setError('Select a test.');
      return;
    }
    if (!value.trim()) {
      setError('Result value is required.');
      return;
    }

    setSaving(true);
    try {
      const api = await getLimsData();
      await api.results.enter({
        resultId,
        value: value.trim(),
        unit: unit.trim() || undefined,
        isCritical: critical,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save result.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
            <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Enter Results</h3>
                <p className="mt-1 text-sm text-muted">Record test values for processing samples</p>
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

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" suppressHydrationWarning>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {!ready ? (
                  <p className="text-sm text-muted">Loading tests…</p>
                ) : (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted">Test</label>
                      <select
                        className="lims-input"
                        name="resultId"
                        required
                        value={resultId}
                        onChange={(e) => setResultId(e.target.value)}
                        disabled={results.length === 0}
                      >
                        {results.length === 0 ? (
                          <option value="">No tests available</option>
                        ) : (
                          results.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.testName} — {r.orderId}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">
                          Value <span className="text-error">*</span>
                        </label>
                        <input
                          className="lims-input"
                          name="value"
                          required
                          placeholder="Result value"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted">Unit</label>
                        <input
                          className="lims-input"
                          name="unit"
                          placeholder="mg/dL, cells/µL…"
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="critical"
                        checked={critical}
                        onChange={(e) => setCritical(e.target.checked)}
                      />
                      Mark as critical value
                    </label>
                  </>
                )}
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
                <button type="button" onClick={onClose} className="lims-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="lims-btn-primary" disabled={!ready || results.length === 0 || saving}>
                  {saving ? 'Saving…' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
