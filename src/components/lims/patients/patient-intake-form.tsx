'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PatientType } from '@/lib/types/lims';
import { addAppointment } from '@/lib/data/appointments-store';
import { addInvoice, addOrder } from '@/lib/data/orders-store';
import {
  addPatient,
  calculateAgeFromDob,
  getNextPatientId,
  PATIENT_TYPE_OPTIONS,
} from '@/lib/data/patients-store';
import { getReferrals, getTests } from '@/lib/data/store';

function SectionCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-muted-border bg-white shadow-card-md">
      <div className="border-b border-muted-border bg-muted-bg/40 px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Step {step}</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  );
}

export function PatientIntakeForm() {
  const router = useRouter();
  const referrals = getReferrals();
  const tests = getTests();

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

  const [scheduledAt, setScheduledAt] = useState('');
  const [appointmentType, setAppointmentType] = useState<'Scheduled' | 'Walk-In'>('Scheduled');
  const [notes, setNotes] = useState('');

  const [selectedTests, setSelectedTests] = useState<string[]>(['TST-CBC']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const orderTotal = useMemo(
    () => tests.filter((t) => selectedTests.includes(t.id)).reduce((sum, t) => sum + t.price, 0),
    [tests, selectedTests],
  );

  const toggleTest = (testId: string) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!scheduledAt) {
      setError('Appointment date and time is required.');
      return;
    }
    if (selectedTests.length === 0) {
      setError('Select at least one test for the order.');
      return;
    }

    setSubmitting(true);
    try {
      const patient = addPatient({
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

      addAppointment({
        patientId: patient.id,
        patientName: patient.name,
        scheduledAt,
        type: appointmentType,
        notes: notes || undefined,
      });

      const chosenTests = tests.filter((t) => selectedTests.includes(t.id));
      const order = addOrder({
        patientId: patient.id,
        patientName: patient.name,
        testIds: chosenTests.map((t) => t.id),
        testNames: chosenTests.map((t) => t.name),
        totalAmount: orderTotal,
      });

      addInvoice({
        orderId: order.id,
        patientId: patient.id,
        patientName: patient.name,
        amount: orderTotal,
      });

      router.push('/billing/collect?success=order');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete intake.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mx-auto max-w-3xl space-y-6" onSubmit={handleSubmit}>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <SectionCard
        step={1}
        title="Register Patient"
        description="Patient demographics and contact details"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Patient ID</label>
          <input
            className="lims-input cursor-not-allowed bg-muted-bg font-mono text-sm text-slate-600"
            value={mounted ? patientId : ''}
            readOnly
            tabIndex={-1}
            placeholder="Auto-generating…"
          />
          <p className="mt-1 text-xs text-muted">Assigned automatically when you save.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              First Name <span className="text-error">*</span>
            </label>
            <input className="lims-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Last Name</label>
            <input className="lims-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">
            Gender <span className="text-error">*</span>
          </label>
          <select className="lims-input" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">DOB</label>
            <input className="lims-input" type="date" value={dateOfBirth} onChange={(e) => handleDobChange(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Age</label>
            <input className="lims-input" type="number" min={0} max={150} value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Mobile Number <span className="text-error">*</span>
            </label>
            <input className="lims-input" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+91 …" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Email <span className="text-error">*</span>
            </label>
            <input className="lims-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@email.com" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Address</label>
          <textarea className="lims-input" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, pin code" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Referred Doctor</label>
            <select className="lims-input" value={referredDoctor} onChange={(e) => setReferredDoctor(e.target.value)}>
              <option value="">None</option>
              {referrals.map((ref) => (
                <option key={ref.id} value={ref.doctorName}>{ref.doctorName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Patient Type</label>
            <select className="lims-input" value={patientType} onChange={(e) => setPatientType(e.target.value as PatientType)}>
              {PATIENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        step={2}
        title="Schedule Appointment"
        description="Book a patient visit or walk-in slot"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Date &amp; time <span className="text-error">*</span>
            </label>
            <input className="lims-input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Type</label>
            <select className="lims-input" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value as typeof appointmentType)}>
              <option value="Scheduled">Scheduled</option>
              <option value="Walk-In">Walk-In</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Notes</label>
          <textarea className="lims-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" />
        </div>
      </SectionCard>

      <SectionCard
        step={3}
        title="Create Order"
        description="Select tests for the new laboratory order"
      >
        <div>
          <label className="mb-2 block text-xs font-medium text-muted">
            Tests <span className="text-error">*</span>
          </label>
          <div className="space-y-2 rounded-md border border-muted-border p-3">
            {tests.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(t.id)}
                  onChange={() => toggleTest(t.id)}
                />
                <span>{t.name}</span>
                <span className="ml-auto text-muted">₹{t.price}</span>
              </label>
            ))}
          </div>
        </div>
        <p className="text-sm font-medium text-slate-900">
          Order total: <span className="text-primary">₹{orderTotal}</span>
        </p>
      </SectionCard>

      <div className="flex flex-wrap gap-3 pb-8">
        <button type="submit" className="lims-btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Register, Schedule & Create Order'}
        </button>
        <Link href="/patients" className="lims-btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
