import type { Appointment } from '@/lib/types/lims';

const STORAGE_KEY = 'labcore-appointments-v1';

const today = new Date().toISOString().slice(0, 10);

export const seedAppointments: Appointment[] = [
  { id: 'APT-001', patientId: 'PAT-000003', patientName: 'Suresh Patel', scheduledAt: `${today}T14:00:00`, type: 'Scheduled', status: 'Scheduled' },
  { id: 'APT-002', patientId: 'PAT-000001', patientName: 'Rahul Verma', scheduledAt: `${today}T11:30:00`, type: 'Walk-In', status: 'Completed' },
];

function cloneSeed(): Appointment[] {
  return seedAppointments.map((a) => ({ ...a }));
}

function loadAppointments(): Appointment[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Appointment[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveAppointments(appointments: Appointment[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

let memoryAppointments = cloneSeed();

export function getAppointments(): Appointment[] {
  if (typeof window !== 'undefined') {
    memoryAppointments = loadAppointments();
  }
  return memoryAppointments.map((a) => ({ ...a }));
}

function getNextAppointmentId(appointments: Appointment[] = getAppointments()): string {
  const max = appointments.reduce((highest, apt) => {
    const match = apt.id.match(/^APT-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `APT-${String(max + 1).padStart(3, '0')}`;
}

export function addAppointment(input: {
  patientId: string;
  patientName: string;
  scheduledAt: string;
  type: Appointment['type'];
  notes?: string;
}): Appointment {
  const appointments = getAppointments();
  const created: Appointment = {
    id: getNextAppointmentId(appointments),
    patientId: input.patientId,
    patientName: input.patientName,
    scheduledAt: input.scheduledAt,
    type: input.type,
    status: 'Scheduled',
    notes: input.notes?.trim() || undefined,
  };
  memoryAppointments = [...appointments, created];
  saveAppointments(memoryAppointments);
  return created;
}
