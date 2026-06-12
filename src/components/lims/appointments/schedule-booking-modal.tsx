'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { SearchableSelect } from '@/components/lims/searchable-select';
import type { Appointment, Invoice, OrderPriority } from '@/lib/types/lims';
import { addBooking } from '@/lib/data/appointments-store';
import { addInvoice, addOrder } from '@/lib/data/orders-store';
import { getPatients } from '@/lib/data/patients-store';
import { getPackages, getReferrals, getTests } from '@/lib/data/store';

const PRIORITY_OPTIONS: OrderPriority[] = ['Normal', 'Urgent', 'STAT'];

interface ScheduleBookingModalProps {
  onClose: () => void;
  onSaved: (result: { booking: Appointment; invoice: Invoice }) => void;
}

export function ScheduleBookingModal({ onClose, onSaved }: ScheduleBookingModalProps) {
  const patients = getPatients();
  const tests = getTests();
  const referrals = getReferrals();
  const packages = getPackages();

  const doctorOptions = useMemo(
    () => [
      { value: '', label: 'None' },
      ...referrals.map((ref) => ({
        value: ref.doctorName,
        label: ref.doctorName,
        meta: ref.specialty,
      })),
    ],
    [referrals],
  );

  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [appointmentType, setAppointmentType] = useState<'Scheduled' | 'Walk-In'>('Scheduled');
  const [priority, setPriority] = useState<OrderPriority>('Normal');
  const [notes, setNotes] = useState('');
  const [packageId, setPackageId] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>(['TST-CBC']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patients.length && !patientId) {
      setPatientId(patients[0].id);
    }
  }, [patients, patientId]);

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === packageId),
    [packages, packageId],
  );

  const orderTotal = useMemo(() => {
    if (selectedPackage) return selectedPackage.price;
    return tests
      .filter((t) => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);
  }, [selectedPackage, tests, selectedTests]);

  const handlePackageChange = (nextPackageId: string) => {
    setPackageId(nextPackageId);
    if (!nextPackageId) return;
    const pkg = packages.find((p) => p.id === nextPackageId);
    if (pkg) {
      setSelectedTests(pkg.testIds);
    }
  };

  const toggleTest = (testId: string) => {
    setPackageId('');
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      setError('Select a patient.');
      return;
    }
    if (!scheduledAt) {
      setError('Appointment date and time is required.');
      return;
    }
    if (selectedTests.length === 0) {
      setError('Select at least one test.');
      return;
    }

    try {
      const chosenTests = tests.filter((t) => selectedTests.includes(t.id));
      const order = addOrder({
        patientId: patient.id,
        patientName: patient.name,
        testIds: chosenTests.map((t) => t.id),
        testNames: chosenTests.map((t) => t.name),
        totalAmount: orderTotal,
        referringDoctor: referringDoctor || undefined,
        priority,
        healthPackageId: selectedPackage?.id,
        healthPackageName: selectedPackage?.name,
      });

      const invoice = addInvoice({
        orderId: order.id,
        patientId: patient.id,
        patientName: patient.name,
        amount: orderTotal,
      });

      const booking = addBooking({
        patientId: patient.id,
        patientName: patient.name,
        scheduledAt,
        type: appointmentType,
        notes: notes || undefined,
        referringDoctor: referringDoctor || undefined,
        priority,
        healthPackageId: selectedPackage?.id,
        healthPackageName: selectedPackage?.name,
        orderId: order.id,
        testIds: chosenTests.map((t) => t.id),
        testNames: chosenTests.map((t) => t.name),
        orderTotal,
      });

      onSaved({ booking, invoice });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not schedule booking.');
    }
  };

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="lims-surface flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden sm:max-h-[min(92vh,calc(100vh-3rem))]">
          <div className="flex shrink-0 items-start justify-between border-b border-muted-border px-6 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Schedule Appointment</h3>
              <p className="mt-1 text-sm text-muted">Book a patient visit and create a lab order</p>
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

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Patient</label>
                <select
                  className="lims-input"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Referring Doctor</label>
                <SearchableSelect
                  options={doctorOptions}
                  value={referringDoctor}
                  onChange={setReferringDoctor}
                  allowCustomValue
                  placeholder="Type or search doctor name…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">
                    Date &amp; time <span className="text-error">*</span>
                  </label>
                  <input
                    className="lims-input"
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Type</label>
                  <select
                    className="lims-input"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as typeof appointmentType)}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Walk-In">Walk-In</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted">Priority</label>
                <div className="flex flex-wrap gap-4">
                  {PRIORITY_OPTIONS.map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-slate-900">
                      <input
                        type="radio"
                        name="priority"
                        value={option}
                        checked={priority === option}
                        onChange={() => setPriority(option)}
                        className="text-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Notes</label>
                <textarea
                  className="lims-input"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes…"
                />
              </div>

              <div className="border-t border-muted-border pt-5">
                <label className="mb-1 block text-xs font-medium text-muted">Health Package</label>
                <select
                  className="lims-input"
                  value={packageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                >
                  <option value="">None</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
                {selectedPackage && (
                  <p className="mt-2 text-xs text-muted">{selectedPackage.description}</p>
                )}
              </div>

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
                <p className="mt-3 text-sm font-medium text-slate-900">
                  Order total: <span className="text-primary">₹{orderTotal}</span>
                  {selectedPackage && (
                    <span className="ml-2 text-xs font-normal text-muted">(package price)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-muted-border bg-white px-6 py-4">
              <button type="button" onClick={onClose} className="lims-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="lims-btn-primary">
                Create Order &amp; Proceed to Billing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
