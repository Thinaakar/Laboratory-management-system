'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ModalPortal } from '@/components/lims/modal-portal';
import { FormField } from '@/components/lims/form-field';
import type { Appointment, OrderPriority } from '@/lib/types/lims';
import { updateAppointment } from '@/lib/data/appointments-store';
import { getReferrals } from '@/lib/data/store';

const PRIORITY_OPTIONS: OrderPriority[] = ['Normal', 'Urgent', 'STAT'];
const STATUS_OPTIONS: Appointment['status'][] = ['Scheduled', 'Completed', 'Cancelled', 'No-Show'];

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSaved: (appointment: Appointment) => void;
}

export function EditAppointmentModal({ appointment, onClose, onSaved }: EditAppointmentModalProps) {
  const referrals = getReferrals();
  const [scheduledAt, setScheduledAt] = useState('');
  const [appointmentType, setAppointmentType] = useState<Appointment['type']>('Scheduled');
  const [status, setStatus] = useState<Appointment['status']>('Scheduled');
  const [referringDoctor, setReferringDoctor] = useState('');
  const [priority, setPriority] = useState<OrderPriority>('Normal');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setScheduledAt(appointment.scheduledAt.slice(0, 16));
    setAppointmentType(appointment.type);
    setStatus(appointment.status);
    setReferringDoctor(appointment.referringDoctor ?? '');
    setPriority(appointment.priority ?? 'Normal');
    setNotes(appointment.notes ?? '');
  }, [appointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!scheduledAt) {
      setError('Scheduled date and time is required.');
      return;
    }
    try {
      const updated = updateAppointment(appointment.id, {
        scheduledAt: new Date(scheduledAt).toISOString(),
        type: appointmentType,
        status,
        referringDoctor: referringDoctor || undefined,
        priority,
        notes,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save appointment.');
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4 sm:p-6">
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div className="lims-surface flex w-full max-w-lg flex-col overflow-hidden">
            <div className="lims-dialog-header">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Edit Appointment</h3>
                <p className="mt-0.5 text-sm text-muted">
                  {appointment.patientName} · <span className="font-mono">{appointment.id}</span>
                </p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-muted hover:bg-muted-bg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="lims-dialog-body space-y-4">
                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <FormField label="Scheduled Date & Time" required htmlFor="edit-apt-scheduled">
                  <input
                    id="edit-apt-scheduled"
                    type="datetime-local"
                    className="lims-input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Type" htmlFor="edit-apt-type">
                  <select id="edit-apt-type" className="lims-input" value={appointmentType} onChange={(e) => setAppointmentType(e.target.value as Appointment['type'])}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Walk-In">Walk-In</option>
                  </select>
                </FormField>
                <FormField label="Status" htmlFor="edit-apt-status">
                  <select id="edit-apt-status" className="lims-input" value={status} onChange={(e) => setStatus(e.target.value as Appointment['status'])}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Referring Doctor" htmlFor="edit-apt-doctor">
                  <select id="edit-apt-doctor" className="lims-input" value={referringDoctor} onChange={(e) => setReferringDoctor(e.target.value)}>
                    <option value="">None</option>
                    {referrals.map((ref) => (
                      <option key={ref.id} value={ref.doctorName}>{ref.doctorName}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Priority" htmlFor="edit-apt-priority">
                  <select id="edit-apt-priority" className="lims-input" value={priority} onChange={(e) => setPriority(e.target.value as OrderPriority)}>
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Notes" htmlFor="edit-apt-notes">
                  <textarea id="edit-apt-notes" className="lims-input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FormField>
              </div>
              <div className="lims-dialog-footer">
                <button type="button" onClick={onClose} className="lims-btn-secondary">Cancel</button>
                <button type="submit" className="lims-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
