import type { Invoice, LabOrder, OrderPriority } from '@/lib/types/lims';

const ORDERS_KEY = 'labcore-orders-v1';
const INVOICES_KEY = 'labcore-invoices-v1';

const today = new Date().toISOString().slice(0, 10);

export const seedOrders: LabOrder[] = [
  {
    id: 'ORD-2026-0001',
    patientId: 'PAT-000001',
    patientName: 'Rahul Verma',
    testIds: ['TST-CBC', 'TST-FBS'],
    testNames: ['Complete Blood Count', 'Fasting Blood Sugar'],
    status: 'Processing',
    totalAmount: 570,
    gstPercent: 0,
    createdAt: `${today}T08:45:00`,
  },
  {
    id: 'ORD-2026-0002',
    patientId: 'PAT-000002',
    patientName: 'Anita Desai',
    testIds: ['TST-LFT'],
    testNames: ['Liver Function Test'],
    status: 'Pending',
    totalAmount: 850,
    createdAt: `${today}T09:30:00`,
  },
  {
    id: 'ORD-2026-0003',
    patientId: 'PAT-000004',
    patientName: 'Kavita Nair',
    testIds: ['TST-TSH'],
    testNames: ['Thyroid Profile (TSH)'],
    status: 'Processing',
    totalAmount: 350,
    createdAt: `${today}T10:15:00`,
  },
  {
    id: 'ORD-2026-0004',
    patientId: 'PAT-000005',
    patientName: 'Vikram Joshi',
    testIds: ['TST-CBC', 'TST-LFT'],
    testNames: ['Complete Blood Count', 'Liver Function Test'],
    status: 'Processing',
    totalAmount: 1300,
    createdAt: `${today}T11:30:00`,
  },
  {
    id: 'ORD-2026-0005',
    patientId: 'PAT-000003',
    patientName: 'Suresh Patel',
    testIds: ['TST-FBS', 'TST-TSH'],
    testNames: ['Fasting Blood Sugar', 'Thyroid Profile (TSH)'],
    status: 'Pending',
    totalAmount: 470,
    createdAt: `${today}T12:00:00`,
  },
];

export const seedInvoices: Invoice[] = [
  { id: 'INV-2026-0001', orderId: 'ORD-2026-0001', patientId: 'PAT-000001', patientName: 'Rahul Verma', amount: 570, paidAmount: 570, status: 'Paid', paymentMethod: 'UPI', createdAt: `${today}T08:50:00` },
  { id: 'INV-2026-0002', orderId: 'ORD-2026-0002', patientId: 'PAT-000002', patientName: 'Anita Desai', amount: 850, paidAmount: 0, status: 'Pending', createdAt: `${today}T09:35:00` },
  { id: 'INV-2026-0003', orderId: 'ORD-2026-0003', patientId: 'PAT-000004', patientName: 'Kavita Nair', amount: 350, paidAmount: 350, status: 'Paid', paymentMethod: 'Card', createdAt: `${today}T10:20:00` },
  { id: 'INV-2026-0004', orderId: 'ORD-2026-0004', patientId: 'PAT-000005', patientName: 'Vikram Joshi', amount: 1300, paidAmount: 800, status: 'Partial', createdAt: `${today}T11:45:00` },
  { id: 'INV-2026-0005', orderId: 'ORD-2026-0005', patientId: 'PAT-000003', patientName: 'Suresh Patel', amount: 470, paidAmount: 0, status: 'Pending', createdAt: `${today}T12:05:00` },
];

function cloneOrders(): LabOrder[] {
  return seedOrders.map((o) => ({ ...o }));
}

function cloneInvoices(): Invoice[] {
  return seedInvoices.map((i) => ({ ...i }));
}

function loadOrders(): LabOrder[] {
  if (typeof window === 'undefined') return cloneOrders();
  try {
    const raw = sessionStorage.getItem(ORDERS_KEY);
    if (!raw) return cloneOrders();
    const parsed = JSON.parse(raw) as LabOrder[];
    return parsed.length ? parsed : cloneOrders();
  } catch {
    return cloneOrders();
  }
}

function loadInvoices(): Invoice[] {
  if (typeof window === 'undefined') return cloneInvoices();
  try {
    const raw = sessionStorage.getItem(INVOICES_KEY);
    if (!raw) return cloneInvoices();
    const parsed = JSON.parse(raw) as Invoice[];
    return parsed.length ? parsed : cloneInvoices();
  } catch {
    return cloneInvoices();
  }
}

function saveOrders(orders: LabOrder[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function saveInvoices(invoices: Invoice[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

let memoryOrders = cloneOrders();
let memoryInvoices = cloneInvoices();

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
  return created;
}
