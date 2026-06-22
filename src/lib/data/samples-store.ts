import type { Sample, SampleStatus } from "@/lib/types/lims";
import { logAuditAction } from "@/lib/audit/log-action";
import { getOrders } from "./orders-store";
import { ensureResultsForOrderSample } from "./results-store";
import { loadFromStorage, saveToStorage } from "./storage-utils";

const STORAGE_KEY = "labcore-samples-v1";

export const seedSamples: Sample[] = [];

function loadSamples(): Sample[] {
  return loadFromStorage<Sample>(STORAGE_KEY, []);
}

function saveSamples(samples: Sample[]) {
  saveToStorage(STORAGE_KEY, samples);
}

let memorySamples: Sample[] = [];

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
  ensureResultsForOrderSample(order, created);
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
