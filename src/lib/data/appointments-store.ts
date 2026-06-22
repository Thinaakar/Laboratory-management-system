import type { Appointment, OrderPriority } from "@/lib/types/lims";
import { logAuditAction } from "@/lib/audit/log-action";
import { loadFromStorage, saveToStorage } from "./storage-utils";

const STORAGE_KEY = "labcore-appointments-v1";

export const seedAppointments: Appointment[] = [];

function loadAppointments(): Appointment[] {
  return loadFromStorage<Appointment>(STORAGE_KEY, []);
}

function saveAppointments(appointments: Appointment[]) {
  saveToStorage(STORAGE_KEY, appointments);
}

let memoryAppointments: Appointment[] = [];

export function getAppointments(): Appointment[] {
  if (typeof window !== "undefined") {
    memoryAppointments = loadAppointments();
  }
  return memoryAppointments.map((a) => ({ ...a }));
}

function getNextAppointmentId(
  appointments: Appointment[] = getAppointments(),
): string {
  const max = appointments.reduce((highest, apt) => {
    const match = apt.id.match(/^APT-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `APT-${String(max + 1).padStart(3, "0")}`;
}

export function addBooking(input: {
  patientId: string;
  patientName: string;
  scheduledAt: string;
  type: Appointment["type"];
  notes?: string;
  referringDoctor?: string;
  priority?: OrderPriority;
  healthPackageId?: string;
  healthPackageName?: string;
  orderId: string;
  testIds: string[];
  testNames: string[];
  orderTotal: number;
}): Appointment {
  const appointments = getAppointments();
  const created: Appointment = {
    id: getNextAppointmentId(appointments),
    patientId: input.patientId,
    patientName: input.patientName,
    scheduledAt: input.scheduledAt,
    type: input.type,
    status: "Scheduled",
    notes: input.notes?.trim() || undefined,
    referringDoctor: input.referringDoctor,
    priority: input.priority ?? "Normal",
    healthPackageId: input.healthPackageId,
    healthPackageName: input.healthPackageName,
    orderId: input.orderId,
    testIds: input.testIds,
    testNames: input.testNames,
    orderTotal: input.orderTotal,
  };
  memoryAppointments = [...appointments, created];
  saveAppointments(memoryAppointments);
  logAuditAction({
    action: "CREATE",
    module: "appointments",
    details: `Scheduled ${created.id} for ${created.patientName}`,
  });
  return created;
}

export function updateAppointment(
  id: string,
  input: {
    scheduledAt?: string;
    type?: Appointment["type"];
    status?: Appointment["status"];
    notes?: string;
    referringDoctor?: string;
    priority?: OrderPriority;
  },
): Appointment {
  const appointments = getAppointments();
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("Appointment not found.");

  const updated: Appointment = {
    ...appointments[index],
    ...(input.scheduledAt !== undefined && { scheduledAt: input.scheduledAt }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.notes !== undefined && { notes: input.notes.trim() || undefined }),
    ...(input.referringDoctor !== undefined && { referringDoctor: input.referringDoctor }),
    ...(input.priority !== undefined && { priority: input.priority }),
  };

  memoryAppointments = appointments.map((a) => (a.id === id ? updated : a));
  saveAppointments(memoryAppointments);
  logAuditAction({ action: "UPDATE", module: "appointments", details: `Updated ${updated.id} for ${updated.patientName}` });
  return updated;
}

export function deleteAppointment(id: string): void {
  const appointments = getAppointments();
  const apt = appointments.find((a) => a.id === id);
  if (!apt) throw new Error("Appointment not found.");
  memoryAppointments = appointments.filter((a) => a.id !== id);
  saveAppointments(memoryAppointments);
  logAuditAction({ action: "DELETE", module: "appointments", details: `Deleted ${apt.id} for ${apt.patientName}` });
}
