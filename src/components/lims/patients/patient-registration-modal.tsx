'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Patient, PatientType } from '@/lib/types/lims';
import {
  addPatient,
  calculateAgeFromDob,
  getNextPatientId,
  PATIENT_TYPE_OPTIONS,
} from '@/lib/data/patients-store';
import { getReferrals } from '@/lib/data/store';

interface PatientRegistrationModalProps {
  onClose: () => void;
  onSaved: (patient: Patient) => void;
}

export function PatientRegistrationModal({ onClose, onSaved }: PatientRegistrationModalProps) {
  const referrals = getReferrals();
  const [patientId, setPatientId] = useState('');
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [referredDoctor, setReferredDoctor] = useState('');
  const [patientType, setPatientType] = useState<PatientType>('Walk-In');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    setPatientId(getNextPatientId());
  }, []);

  const handleDobChange = (value: string) => {
    setDateOfBirth(value);
    if (value) {
      const computed = calculateAgeFromDob(value);
      setAge(computed !== undefined ? String(computed) : '');
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGender('Male');
    setDateOfBirth('');
    setAge('');
    setPhone('');
    setEmail('');
    setAddress('');
    setReferredDoctor('');
    setPatientType('Walk-In');
    setError('');
    setPatientId(getNextPatientId());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Mobile number is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    try {
      const created = addPatient({
        firstName,
        lastName: lastName || undefined,
        phone,
        gender,
        email: email.trim(),
        dateOfBirth: dateOfBirth || undefined,
        age: age ? Number(age) : undefined,
        address: address || undefined,
        referredDoctor: referredDoctor || undefined,
        patientType,
      });
      onSaved(created);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save patient.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 sm:p-6">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-muted-border bg-white shadow-xl sm:max-h-[min(92vh,calc(100vh-3rem))]">
          <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Register Patient</h3>
              <p className="mt-1 text-sm text-muted">Add a new patient to the laboratory registry</p>
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

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Patient ID</label>
            <input
              className="lims-input cursor-not-allowed bg-muted-bg font-mono text-sm text-slate-600"
              value={mounted ? patientId : ''}
              readOnly
              tabIndex={-1}
              placeholder="Auto-generating…"
              aria-readonly="true"
            />
            <p className="mt-1 text-xs text-muted">Assigned automatically when you save.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                First Name <span className="text-error">*</span>
              </label>
              <input
                className="lims-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Last Name</label>
              <input
                className="lims-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Gender <span className="text-error">*</span>
            </label>
            <select
              className="lims-input"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">DOB</label>
              <input
                className="lims-input"
                type="date"
                value={dateOfBirth}
                onChange={(e) => handleDobChange(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Age</label>
              <input
                className="lims-input"
                type="number"
                min={0}
                max={150}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Mobile Number <span className="text-error">*</span>
              </label>
              <input
                className="lims-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 …"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Email <span className="text-error">*</span>
              </label>
              <input
                className="lims-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Address</label>
            <textarea
              className="lims-input"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, pin code"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Referred Doctor</label>
              <select
                className="lims-input"
                value={referredDoctor}
                onChange={(e) => setReferredDoctor(e.target.value)}
              >
                <option value="">None</option>
                {referrals.map((ref) => (
                  <option key={ref.id} value={ref.doctorName}>
                    {ref.doctorName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Patient Type</label>
              <select
                className="lims-input"
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as PatientType)}
              >
                {PATIENT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
              <button type="button" onClick={onClose} className="lims-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="lims-btn-primary">
                Save Patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
