'use client';

import { useState } from 'react';
import { getDepartments } from '@/lib/data/departments-store';
import { SAMPLE_TYPE_OPTIONS } from '@/lib/data/tests-store';

interface TestFormModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    departmentId: string;
    sampleType: string;
    price: number;
    turnaroundHours: number;
    unit?: string;
    referenceRange?: string;
    isActive: boolean;
  }) => void;
}

export function TestFormModal({ onClose, onSave }: TestFormModalProps) {
  const departments = getDepartments();
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? '');
  const [sampleType, setSampleType] = useState<string>(SAMPLE_TYPE_OPTIONS[0]);
  const [price, setPrice] = useState('');
  const [turnaroundHours, setTurnaroundHours] = useState('4');
  const [unit, setUnit] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Test</h3>
        <p className="mt-1 text-sm text-muted">Add a test to the catalog with pricing and reference ranges.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (!departments.length) {
              setError('Create a department before adding tests.');
              return;
            }
            try {
              onSave({
                name,
                departmentId,
                sampleType,
                price: Number(price),
                turnaroundHours: Number(turnaroundHours),
                unit: unit || undefined,
                referenceRange: referenceRange || undefined,
                isActive,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create test.');
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Test name</label>
            <input
              className="lims-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Complete Blood Count"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Department</label>
              <select
                className="lims-input"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Sample type</label>
              <select
                className="lims-input"
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
              >
                {SAMPLE_TYPE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Price (₹)</label>
              <input
                type="number"
                min={0}
                step={1}
                className="lims-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="450"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">TAT (hours)</label>
              <input
                type="number"
                min={1}
                step={1}
                className="lims-input"
                value={turnaroundHours}
                onChange={(e) => setTurnaroundHours(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Unit (optional)</label>
              <input
                className="lims-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. mg/dL"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Reference range (optional)</label>
              <input
                className="lims-input"
                value={referenceRange}
                onChange={(e) => setReferenceRange(e.target.value)}
                placeholder="e.g. 70–100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <select
              className="lims-input"
              value={isActive ? 'Active' : 'Inactive'}
              onChange={(e) => setIsActive(e.target.value === 'Active')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
