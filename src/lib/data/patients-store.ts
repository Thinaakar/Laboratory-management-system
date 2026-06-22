import type { BloodGroup, Patient, PatientType } from "@/lib/types/lims";
import { logAuditAction } from "@/lib/audit/log-action";

import { loadFromStorage, saveToStorage } from './storage-utils';

const STORAGE_KEY = "labcore-patients-v3";

export const PATIENT_TYPE_OPTIONS: PatientType[] = [
  "Walk-In",
  "Scheduled",
  "Corporate",
  "Insurance",
  "Camp",
];

export const BLOOD_GROUP_OPTIONS: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export function calculateAgeFromDob(dateOfBirth: string): number | undefined {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : undefined;
}

export const seedPatients: Patient[] = [];

function loadPatients(): Patient[] {
  return loadFromStorage<Patient>(STORAGE_KEY, []);
}

function savePatients(patients: Patient[]) {
  saveToStorage(STORAGE_KEY, patients);
}

let memoryPatients: Patient[] = [];

export function getPatients(): Patient[] {
  if (typeof window !== "undefined") {
    memoryPatients = loadPatients();
  }
  return memoryPatients.map((p) => ({ ...p }));
}

export function getNextPatientId(patients: Patient[] = getPatients()): string {
  const max = patients.reduce((highest, patient) => {
    const match = patient.id.match(/^PAT-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `PAT-${String(max + 1).padStart(6, "0")}`;
}

export function addPatient(input: {
  firstName: string;
  lastName?: string;
  phone: string;
  gender: Patient["gender"];
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;
  age?: number;
  address?: string;
  referredDoctor?: string;
  patientType?: PatientType;
  branchId?: string;
}): Patient {
  const patients = getPatients();
  const id = getNextPatientId(patients);
  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const dateOfBirth = input.dateOfBirth || undefined;
  const age =
    input.age ?? (dateOfBirth ? calculateAgeFromDob(dateOfBirth) : undefined);

  const created: Patient = {
    id,
    branchId: input.branchId,
    firstName,
    lastName: lastName || undefined,
    name,
    phone: input.phone.trim(),
    bloodGroup: input.bloodGroup,
    dateOfBirth,
    age,
    gender: input.gender,
    address: input.address?.trim() || undefined,
    referredDoctor: input.referredDoctor?.trim() || undefined,
    patientType: input.patientType,
    createdAt: new Date().toISOString(),
  };

  memoryPatients = [...patients, created];
  savePatients(memoryPatients);
  logAuditAction({
    action: "CREATE",
    module: "patients",
    details: `Registered ${created.id} — ${created.name}`,
  });
  return created;
}

export function updatePatient(
  id: string,
  input: {
    firstName: string;
    lastName?: string;
    phone: string;
    gender: Patient["gender"];
    bloodGroup?: BloodGroup;
    dateOfBirth?: string;
    age?: number;
    address?: string;
    referredDoctor?: string;
    patientType?: PatientType;
  },
): Patient {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Patient not found.");

  const firstName = input.firstName.trim();
  const lastName = input.lastName?.trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");
  const dateOfBirth = input.dateOfBirth || undefined;
  const age = input.age ?? (dateOfBirth ? calculateAgeFromDob(dateOfBirth) : undefined);

  const updated: Patient = {
    ...patients[index],
    firstName,
    lastName: lastName || undefined,
    name,
    phone: input.phone.trim(),
    bloodGroup: input.bloodGroup,
    dateOfBirth,
    age,
    gender: input.gender,
    address: input.address?.trim() || undefined,
    referredDoctor: input.referredDoctor?.trim() || undefined,
    patientType: input.patientType,
  };

  memoryPatients = patients.map((p) => (p.id === id ? updated : p));
  savePatients(memoryPatients);
  logAuditAction({ action: "UPDATE", module: "patients", details: `Updated ${updated.id} — ${updated.name}` });
  return updated;
}

export function deletePatient(id: string): void {
  const patients = getPatients();
  const patient = patients.find((p) => p.id === id);
  if (!patient) throw new Error("Patient not found.");
  memoryPatients = patients.filter((p) => p.id !== id);
  savePatients(memoryPatients);
  logAuditAction({ action: "DELETE", module: "patients", details: `Deleted ${patient.id} — ${patient.name}` });
}
