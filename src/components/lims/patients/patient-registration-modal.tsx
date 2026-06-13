'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { FormField, FormGrid } from '@/components/lims/form-field';
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

    try {
      const created = addPatient({
        firstName,
        lastName: lastName || undefined,
        phone,
        gender,
        email: email.trim() || undefined,
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
    <ModalPortal>
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="lims-surface flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
          <div className="lims-dialog-header">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Register Patient</h3>
              <p className="mt-0.5 text-sm text-muted">Add a new patient to the laboratory registry</p>
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
            <div className="lims-dialog-body">
          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <FormField label="Patient ID" hint="Assigned automatically when you save.">
            <input
              className="lims-input cursor-not-allowed bg-slate-50 font-mono text-sm text-slate-600"
              value={mounted ? patientId : ''}
              readOnly
              tabIndex={-1}
              placeholder="Auto-generating…"
              aria-readonly="true"
            />
          </FormField>

          <FormGrid>
            <FormField label="First Name" required htmlFor="patient-first-name">
              <input
                id="patient-first-name"
                className="lims-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First name"
              />
            </FormField>
            <FormField label="Last Name" htmlFor="patient-last-name">
              <input
                id="patient-last-name"
                className="lims-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </FormField>
          </FormGrid>

          <FormField label="Gender" required htmlFor="patient-gender">
            <select
              id="patient-gender"
              className="lims-input"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <FormGrid>
            <FormField label="Date of Birth" htmlFor="patient-dob">
              <input
                id="patient-dob"
                className="lims-input"
                type="date"
                value={dateOfBirth}
                onChange={(e) => handleDobChange(e.target.value)}
              />
            </FormField>
            <FormField label="Age" htmlFor="patient-age">
              <input
                id="patient-age"
                className="lims-input"
                type="number"
                min={0}
                max={150}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Years"
              />
            </FormField>
          </FormGrid>

          <FormGrid>
            <FormField label="Mobile Number" required htmlFor="patient-phone">
              <input
                id="patient-phone"
                className="lims-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+91 …"
              />
            </FormField>
            <FormField label="Email" optional htmlFor="patient-email">
              <input
                id="patient-email"
                className="lims-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
              />
            </FormField>
          </FormGrid>

          <FormField label="Address" htmlFor="patient-address">
            <textarea
              id="patient-address"
              className="lims-input"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, pin code"
            />
          </FormField>

          <FormGrid>
            <FormField label="Referred Doctor" htmlFor="patient-referral">
              <select
                id="patient-referral"
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
            </FormField>
            <FormField label="Patient Type" htmlFor="patient-type">
              <select
                id="patient-type"
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
            </FormField>
          </FormGrid>

            </div>

            <div className="lims-dialog-footer">
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
    </ModalPortal>
  );
}
