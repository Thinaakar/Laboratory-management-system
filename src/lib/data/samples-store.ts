import type { Sample, SampleStatus } from "@/lib/types/lims";
import { logAuditAction } from "@/lib/audit/log-action";
import { getOrders } from "./orders-store";
import { seedPatients } from "./patients-store";

const STORAGE_KEY = "labcore-samples-v1";

function dateOffset(daysAgo: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const date = d.toISOString().slice(0, 10);
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

const TREND_DAY_COUNTS = [5, 7, 6, 10, 8, 11, 9];

function buildSeedSamples(): Sample[] {
  const statuses: Sample["status"][] = ["Registered", "Collected", "Received", "Processing", "Completed"];
  const patients = seedPatients;
  let seq = 1;
  const samples: Sample[] = [];

  TREND_DAY_COUNTS.forEach((count, dayIndex) => {
    const daysAgo = 6 - dayIndex;
    for (let i = 0; i < count; i++) {
      const patient = patients[(seq - 1) % patients.length];
      const status =
        daysAgo === 0
          ? statuses[i % 4]
          : daysAgo <= 1
            ? "Processing"
            : "Completed";
      const createdAt = dateOffset(daysAgo, 8 + (i % 9), (i * 7) % 60);
      const id = `SMP-2026-${String(seq).padStart(4, "0")}`;
      samples.push({
        id,
        orderId: seq <= 2 ? `ORD-2026-000${seq}` : `ORD-2026-000${((seq - 1) % 5) + 1}`,
        patientId: patient.id,
        patientName: patient.name,
        barcode: `BC2026${String(seq).padStart(4, "0")}`,
        sampleType: i % 5 === 0 ? "Urine" : "Blood",
        status,
        collectedAt:
          status !== "Registered"
            ? createdAt.replace(/T(\d+)/, (_, h) => `T${String(Number(h) + 1).padStart(2, "0")}`)
            : undefined,
        receivedAt: ["Received", "Processing", "Completed"].includes(status)
          ? dateOffset(daysAgo, 9 + (i % 8), 15)
          : undefined,
        createdAt,
      });
      seq += 1;
    }
  });

  return samples;
}

export const seedSamples: Sample[] = buildSeedSamples();

function cloneSeed(): Sample[] {
  return seedSamples.map((s) => ({ ...s }));
}

function loadSamples(): Sample[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Sample[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveSamples(samples: Sample[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}

let memorySamples = cloneSeed();

export function getSamples(): Sample[] {
  if (typeof window !== "undefined") {
    memorySamples = loadSamples();
  }
  return memorySamples.map((s) => ({ ...s }));
}

export function getNextSampleId(samples: Sample[] = getSamples()): string {
  const max = samples.reduce((highest, sample) => {
    const match = sample.id.match(/^SMP-2026-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `SMP-2026-${String(max + 1).padStart(4, "0")}`;
}

export function getNextBarcode(samples: Sample[] = getSamples()): string {
  const max = samples.reduce((highest, sample) => {
    const match = sample.barcode.match(/^BC2026(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `BC2026${String(max + 1).padStart(4, "0")}`;
}

export function addSample(input: {
  orderId: string;
  sampleType: string;
  barcode: string;
  collectedAt: string;
}): Sample {
  const orders = getOrders();
  const order = orders.find((o) => o.id === input.orderId);
  if (!order) throw new Error("Order not found.");

  const samples = getSamples();
  const collectedAt = new Date(input.collectedAt).toISOString();
  const created: Sample = {
    id: getNextSampleId(samples),
    orderId: input.orderId,
    patientId: order.patientId,
    patientName: order.patientName,
    barcode: input.barcode.trim(),
    sampleType: input.sampleType,
    status: "Collected",
    collectedAt,
    createdAt: new Date().toISOString(),
  };

  memorySamples = [...samples, created];
  saveSamples(memorySamples);
  logAuditAction({
    action: "CREATE",
    module: "samples",
    details: `Registered sample ${created.barcode} for order ${created.orderId}`,
  });
  return created;
}

export function updateSample(
  id: string,
  input: {
    sampleType: string;
    status: SampleStatus;
    collectedAt?: string;
  },
): Sample {
  const samples = getSamples();
  const index = samples.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Sample not found.");

  const updated: Sample = {
    ...samples[index],
    sampleType: input.sampleType,
    status: input.status,
    collectedAt: input.collectedAt
      ? new Date(input.collectedAt).toISOString()
      : samples[index].collectedAt,
  };

  memorySamples = samples.map((s) => (s.id === id ? updated : s));
  saveSamples(memorySamples);
  logAuditAction({
    action: "UPDATE",
    module: "samples",
    details: `Updated sample ${updated.id} (${updated.barcode})`,
  });
  return updated;
}

export function deleteSample(id: string): void {
  const samples = getSamples();
  const sample = samples.find((s) => s.id === id);
  if (!sample) throw new Error("Sample not found.");
  memorySamples = samples.filter((s) => s.id !== id);
  saveSamples(memorySamples);
  logAuditAction({
    action: "DELETE",
    module: "samples",
    details: `Deleted sample ${sample.id} (${sample.barcode})`,
  });
}
