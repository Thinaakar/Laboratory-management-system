import type { BloodGroup, Patient, PatientType } from "@/lib/types/lims";
import { logAuditAction } from "@/lib/audit/log-action";

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

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] ?? fullName };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function withNames(
  patient: Omit<Patient, "firstName" | "lastName"> & { name: string },
): Patient {
  const { firstName, lastName } = splitName(patient.name);
  return { ...patient, firstName, lastName };
}

const today = new Date().toISOString().slice(0, 10);

function dateOffset(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const date = d.toISOString().slice(0, 10);
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

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

export const seedPatients: Patient[] = [
  withNames({
    id: "PAT-000001",
    name: "Rahul Verma",
    phone: "+91 98765 43210",
    bloodGroup: "O+",
    dateOfBirth: "1988-04-12",
    gender: "Male",
    patientType: "Walk-In",
    createdAt: `${today}T08:30:00`,
  }),
  withNames({
    id: "PAT-000002",
    name: "Anita Desai",
    phone: "+91 98765 43211",
    bloodGroup: "A+",
    dateOfBirth: "1995-11-03",
    gender: "Female",
    patientType: "Scheduled",
    createdAt: `${today}T09:15:00`,
  }),
  withNames({
    id: "PAT-000003",
    name: "Suresh Patel",
    phone: "+91 98765 43212",
    bloodGroup: "B+",
    dateOfBirth: "1975-07-22",
    gender: "Male",
    patientType: "Walk-In",
    createdAt: "2026-03-01T10:00:00",
  }),
  withNames({
    id: "PAT-000004",
    name: "Kavita Nair",
    phone: "+91 98765 43213",
    bloodGroup: "AB+",
    dateOfBirth: "1990-02-18",
    gender: "Female",
    patientType: "Corporate",
    createdAt: `${today}T10:05:00`,
  }),
  withNames({
    id: "PAT-000005",
    name: "Vikram Joshi",
    phone: "+91 98765 43214",
    bloodGroup: "O-",
    dateOfBirth: "1982-09-07",
    gender: "Male",
    patientType: "Walk-In",
    createdAt: `${today}T11:20:00`,
  }),
  withNames({
    id: "PAT-000006",
    name: "Meera Iyer",
    phone: "+91 98765 43215",
    bloodGroup: "A-",
    dateOfBirth: "1998-06-25",
    gender: "Female",
    patientType: "Insurance",
    createdAt: dateOffset(1, 9, 30),
  }),
  withNames({
    id: "PAT-000007",
    name: "Arjun Mehta",
    phone: "+91 98765 43216",
    bloodGroup: "B-",
    dateOfBirth: "1970-12-01",
    gender: "Male",
    patientType: "Walk-In",
    createdAt: dateOffset(2, 14, 0),
  }),
  withNames({
    id: "PAT-000008",
    name: "Priya Sharma",
    phone: "+91 98765 43217",
    bloodGroup: "AB-",
    dateOfBirth: "1993-08-14",
    gender: "Female",
    patientType: "Scheduled",
    createdAt: dateOffset(3, 11, 0),
  }),
  withNames({
    id: "PAT-000009",
    name: "Rohan Das",
    phone: "+91 98765 43218",
    bloodGroup: "O+",
    dateOfBirth: "1985-03-30",
    gender: "Male",
    patientType: "Camp",
    createdAt: dateOffset(4, 16, 45),
  }),
  withNames({
    id: "PAT-000010",
    name: "Sneha Kapoor",
    phone: "+91 98765 43219",
    bloodGroup: "A+",
    dateOfBirth: "1991-11-11",
    gender: "Female",
    patientType: "Walk-In",
    createdAt: dateOffset(5, 10, 15),
  }),
  withNames({
    id: "PAT-000011",
    name: "Kiran Reddy",
    phone: "+91 98765 43220",
    bloodGroup: "B+",
    dateOfBirth: "1978-07-09",
    gender: "Male",
    patientType: "Walk-In",
    createdAt: "2026-02-15T09:00:00",
  }),
  withNames({
    id: "PAT-000012",
    name: "Ananya Singh",
    phone: "+91 98765 43221",
    bloodGroup: "AB+",
    dateOfBirth: "2000-01-22",
    gender: "Female",
    patientType: "Scheduled",
    createdAt: dateOffset(6, 8, 0),
  }),
].map((p) => ({
  ...p,
  age: p.dateOfBirth ? calculateAgeFromDob(p.dateOfBirth) : undefined,
}));

function cloneSeed(): Patient[] {
  return seedPatients.map((p) => ({ ...p }));
}

function loadPatients(): Patient[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Patient[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function savePatients(patients: Patient[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

let memoryPatients = cloneSeed();

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
