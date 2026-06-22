'use client';

import { useState } from 'react';
import type { LabTest } from '@/lib/types/lims';

interface PackageFormModalProps {
  tests: LabTest[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    testIds: string[];
    price: number;
    description?: string;
  }) => void | Promise<void>;
}

export function PackageFormModal({ tests: allTests, onClose, onSave }: PackageFormModalProps) {
  const tests = allTests.filter((t) => t.isActive);
  const [name, setName] = useState('');
  const [testIds, setTestIds] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const toggleTest = (id: string) => {
    setTestIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Package</h3>
        <p className="mt-1 text-sm text-muted">Bundle tests into a health package with package pricing.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            if (!testIds.length) {
              setError('Select at least one test.');
              return;
            }
            try {
              await onSave({
                name,
                testIds,
                price: Number(price),
                description: description || undefined,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create package.');
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Package name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Basic Health Package"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Tests included ({testIds.length} selected)
            </label>
            {tests.length === 0 ? (
              <p className="text-sm text-muted">No active tests available. Add tests first.</p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3">
                {tests.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={testIds.includes(t.id)}
                      onChange={() => toggleTest(t.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-slate-900">{t.name}</span>
                    <span className="font-mono text-xs text-muted">{t.id}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Package price (₹)</label>
            <input
              type="number"
              min={0}
              step={1}
              className="lims-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="520"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Description (optional)</label>
            <textarea
              className="lims-input min-h-[72px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what is included"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary" disabled={!tests.length}>
              Create Package
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
