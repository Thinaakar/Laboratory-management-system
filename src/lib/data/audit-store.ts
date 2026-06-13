import type { AuditLogEntry } from '@/lib/types/lims';

const STORAGE_KEY = 'labcore-audit-v1';

const today = new Date().toISOString().slice(0, 10);

export const seedAuditLogs: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    userId: 'USR-RECEP',
    userName: 'Priya Sharma',
    action: 'CREATE',
    module: 'patients',
    timestamp: `${today}T08:30:00`,
    details: 'Registered PAT-000001',
  },
  {
    id: 'AUD-002',
    userId: 'USR-LAB',
    userName: 'Arun Kumar',
    action: 'UPDATE',
    module: 'results',
    timestamp: `${today}T10:35:00`,
    details: 'Entered results for SMP-2026-0001',
  },
  {
    id: 'AUD-003',
    userId: 'USR-ADMIN',
    userName: 'System Admin',
    action: 'LOGIN',
    module: 'auth',
    timestamp: `${today}T08:00:00`,
    ipAddress: '192.168.1.10',
  },
];

function cloneSeed(): AuditLogEntry[] {
  return seedAuditLogs.map((e) => ({ ...e }));
}

function loadAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as AuditLogEntry[];
    return parsed.length ? parsed : cloneSeed();
  } catch {
    return cloneSeed();
  }
}

function saveAuditLogs(logs: AuditLogEntry[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

let memoryAuditLogs = cloneSeed();

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window !== 'undefined') {
    memoryAuditLogs = loadAuditLogs();
  }
  return [...memoryAuditLogs]
    .map((e) => ({ ...e }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function addAuditLog(input: {
  userId: string;
  userName: string;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
}): AuditLogEntry {
  const logs = getAuditLogs();
  const created: AuditLogEntry = {
    id: `AUD-${Date.now()}`,
    userId: input.userId,
    userName: input.userName,
    action: input.action,
    module: input.module,
    timestamp: new Date().toISOString(),
    details: input.details?.trim() || undefined,
    ipAddress: input.ipAddress,
  };
  memoryAuditLogs = [...logs, created];
  saveAuditLogs(memoryAuditLogs);
  return created;
}
