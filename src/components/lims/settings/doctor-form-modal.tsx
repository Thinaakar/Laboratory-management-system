'use client';

import { useState } from 'react';

interface DoctorFormModalProps {
  onClose: () => void;
  onSave: (data: { doctorName: string; specialty?: string; phone?: string }) => void;
}

export function DoctorFormModal({ onClose, onSave }: DoctorFormModalProps) {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="lims-surface w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">New Doctor</h3>
        <p className="mt-1 text-sm text-muted">Add a referring doctor for appointments and orders.</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            try {
              onSave({
                doctorName,
                specialty: specialty || undefined,
                phone: phone || undefined,
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not create doctor.');
            }
          }}
        >
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Doctor name</label>
            <input
              className="lims-input"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              required
              placeholder="e.g. Dr. Anil Kapoor"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Specialty (optional)</label>
            <input
              className="lims-input"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="e.g. General Physician"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Phone (optional)</label>
            <input
              className="lims-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 00000"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lims-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="lims-btn-primary">
              Create Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
