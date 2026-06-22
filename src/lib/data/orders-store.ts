import type { Invoice, LabOrder, OrderPriority } from '@/lib/types/lims';
import { logAuditAction } from '@/lib/audit/log-action';
import { loadFromStorage, saveToStorage } from './storage-utils';

const ORDERS_KEY = 'labcore-orders-v1';
const INVOICES_KEY = 'labcore-invoices-v1';

export const seedOrders: LabOrder[] = [];
export const seedInvoices: Invoice[] = [];

function loadOrders(): LabOrder[] {
  return loadFromStorage<LabOrder>(ORDERS_KEY, []);
}

function loadInvoices(): Invoice[] {
  return loadFromStorage<Invoice>(INVOICES_KEY, []);
}

function saveOrders(orders: LabOrder[]) {
  saveToStorage(ORDERS_KEY, orders);
}

function saveInvoices(invoices: Invoice[]) {
  saveToStorage(INVOICES_KEY, invoices);
}

let memoryOrders: LabOrder[] = [];
let memoryInvoices: Invoice[] = [];

export function getOrders(): LabOrder[] {
  if (typeof window !== 'undefined') {
    memoryOrders = loadOrders();
  }
  return memoryOrders.map((o) => ({ ...o }));
}

export function getInvoices(): Invoice[] {
  if (typeof window !== 'undefined') {
    memoryInvoices = loadInvoices();
  }
  return memoryInvoices.map((i) => ({ ...i }));
}

function getNextOrderId(orders: LabOrder[] = getOrders()): string {
  const max = orders.reduce((highest, order) => {
    const match = order.id.match(/^ORD-2026-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `ORD-2026-${String(max + 1).padStart(4, '0')}`;
}

function getNextInvoiceId(invoices: Invoice[] = getInvoices()): string {
  const max = invoices.reduce((highest, invoice) => {
    const match = invoice.id.match(/^INV-2026-(\d+)$/i);
    const num = match ? parseInt(match[1], 10) : NaN;
    return Number.isNaN(num) ? highest : Math.max(highest, num);
  }, 0);
  return `INV-2026-${String(max + 1).padStart(4, '0')}`;
}

export function addOrder(input: {
  patientId: string;
  patientName: string;
  testIds: string[];
  testNames: string[];
  totalAmount: number;
  referringDoctor?: string;
  priority?: OrderPriority;
  healthPackageId?: string;
  healthPackageName?: string;
}): LabOrder {
  const orders = getOrders();
  const created: LabOrder = {
    id: getNextOrderId(orders),
    patientId: input.patientId,
    patientName: input.patientName,
    testIds: input.testIds,
    testNames: input.testNames,
    status: 'Pending',
    totalAmount: input.totalAmount,
    gstPercent: 0,
    referringDoctor: input.referringDoctor,
    priority: input.priority ?? 'Normal',
    healthPackageId: input.healthPackageId,
    healthPackageName: input.healthPackageName,
    createdAt: new Date().toISOString(),
  };
  memoryOrders = [...orders, created];
  saveOrders(memoryOrders);
  logAuditAction({
    action: 'CREATE',
    module: 'billing',
    details: `Created order ${created.id} for ${created.patientName}`,
  });
  return created;
}

export function addInvoice(input: {
  orderId: string;
  patientId: string;
  patientName: string;
  amount: number;
}): Invoice {
  const invoices = getInvoices();
  const created: Invoice = {
    id: getNextInvoiceId(invoices),
    orderId: input.orderId,
    patientId: input.patientId,
    patientName: input.patientName,
    amount: input.amount,
    paidAmount: 0,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  memoryInvoices = [...invoices, created];
  saveInvoices(memoryInvoices);
  logAuditAction({
    action: 'CREATE',
    module: 'billing',
    details: `Created invoice ${created.id} for ${created.patientName}`,
  });
  return created;
}

export function recordInvoicePayment(input: {
  invoiceId: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
}): Invoice {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === input.invoiceId);
  if (index === -1) throw new Error('Invoice not found.');
  const existing = invoices[index];
  const due = existing.amount - existing.paidAmount;
  if (input.amount > due + 0.001) throw new Error('Payment exceeds outstanding balance.');
  const paidAmount = existing.paidAmount + input.amount;
  const status =
    paidAmount >= existing.amount ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Pending';
  const updated: Invoice = {
    ...existing,
    paidAmount,
    status,
    paymentMethod: input.paymentMethod,
  };
  memoryInvoices = invoices.map((i) => (i.id === input.invoiceId ? updated : i));
  saveInvoices(memoryInvoices);
  logAuditAction({
    action: 'UPDATE',
    module: 'billing',
    details: `Recorded ${input.paymentMethod} payment of ₹${input.amount} for ${existing.id}`,
  });
  return updated;
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices();
  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) throw new Error('Invoice not found.');
  memoryInvoices = invoices.filter((i) => i.id !== id);
  saveInvoices(memoryInvoices);
  logAuditAction({
    action: 'DELETE',
    module: 'billing',
    details: `Deleted invoice ${invoice.id} for ${invoice.patientName}`,
  });
}
