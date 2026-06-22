import type { TestResult } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';
import { loadFromStorage, saveToStorage } from './storage-utils';

const STORAGE_KEY = 'labcore-results-v1';

export const seedResults: TestResult[] = [];

function loadResults(): TestResult[] {
  return loadFromStorage<TestResult>(STORAGE_KEY, []);
}

function saveResults(results: TestResult[]) {
  saveToStorage(STORAGE_KEY, results);
}

let memoryResults: TestResult[] = [];

export function getResults(): TestResult[] {
  if (typeof window !== 'undefined') {
    memoryResults = loadResults();
  }
  return memoryResults.map((r) => ({ ...r }));
}

export function getResultById(id: string): TestResult | undefined {
  return getResults().find((r) => r.id === id);
}

export function enterResultLocal(input: {
  resultId: string;
  value: string;
  unit?: string;
  isCritical?: boolean;
  enteredBy?: string;
}): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === input.resultId);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    value: input.value.trim(),
    unit: input.unit?.trim() || results[index].unit,
    isCritical: input.isCritical ?? false,
    queueStatus: 'Completed',
    enteredBy: input.enteredBy ?? results[index].enteredBy,
    enteredAt: new Date().toISOString(),
    approvalStatus: 'Pending',
  };
  memoryResults = results.map((r) => (r.id === input.resultId ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'UPDATE',
    module: 'results',
    details: `Entered result for ${updated.testName}: ${updated.value}`,
  });
  return updated;
}

export function approveResultLocal(id: string, approvedBy: string): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    approvalStatus: 'Approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
  };
  memoryResults = results.map((r) => (r.id === id ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'APPROVE',
    module: 'reports',
    details: `Approved result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}

export function rejectResultLocal(
  id: string,
  approvedBy: string,
  pathologistNotes?: string,
): TestResult {
  const results = getResults();
  const index = results.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Result not found.');
  const updated: TestResult = {
    ...results[index],
    approvalStatus: 'Rejected',
    pathologistNotes,
    approvedBy,
    approvedAt: new Date().toISOString(),
  };
  memoryResults = results.map((r) => (r.id === id ? updated : r));
  saveResults(memoryResults);
  logAuditAction({
    action: 'REJECT',
    module: 'reports',
    details: `Rejected result ${updated.id} — ${updated.testName}`,
  });
  return updated;
}
