import { forceReseed } from '@/lib/firestore/seed';
import { seedDocument } from '@/lib/firestore/app-writes';
import {
  ensureDb,
  handleRouteError,
  jsonData,
  requireAuth,
  useRemoteDb,
} from '@/lib/api/route-helpers';

const MOCK_PATIENTS = [
  {
    id: 'PAT-000001',
    branchId: 'BR-MAIN',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    phone: '9876543210',
    dateOfBirth: '1992-05-15',
    age: 34,
    gender: 'Male',
    bloodGroup: 'O+',
    address: '123 Main St, Springfield',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Walk-In',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'PAT-000002',
    branchId: 'BR-MAIN',
    firstName: 'Sarah',
    lastName: 'Connor',
    name: 'Sarah Connor',
    phone: '9876543211',
    dateOfBirth: '1998-09-20',
    age: 27,
    gender: 'Female',
    bloodGroup: 'A+',
    address: '742 Evergreen Terrace, Springfield',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000003',
    branchId: 'BR-MAIN',
    firstName: 'Tony',
    lastName: 'Stark',
    name: 'Tony Stark',
    phone: '9876543212',
    dateOfBirth: '1981-04-11',
    age: 45,
    gender: 'Male',
    bloodGroup: 'AB+',
    address: '10880 Malibu Point, Malibu',
    referredDoctor: 'Dr. Nick Riviera',
    patientType: 'Corporate',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000004',
    branchId: 'BR-MAIN',
    firstName: 'Bruce',
    lastName: 'Wayne',
    name: 'Bruce Wayne',
    phone: '9876543213',
    dateOfBirth: '1988-02-19',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O-',
    address: '1007 Mountain Drive, Gotham',
    referredDoctor: 'Dr. Julius Hibbert',
    patientType: 'Insurance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PAT-000005',
    branchId: 'BR-MAIN',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    phone: '9876543214',
    dateOfBirth: '2001-12-05',
    age: 24,
    gender: 'Female',
    bloodGroup: 'B+',
    address: '456 Oak Ave, Springfield',
    referredDoctor: 'Dr. Nick Riviera',
    patientType: 'Walk-In',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_ORDERS = [
  {
    id: 'ORD-2026-0001',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    testIds: ['T-CBC', 'T-TSH'],
    testNames: ['Complete Blood Count', 'Thyroid Stimulating Hormone'],
    status: 'Completed',
    totalAmount: 650,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0002',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    testIds: ['T-FBS'],
    testNames: ['Fasting Blood Sugar'],
    status: 'Processing',
    totalAmount: 150,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'Urgent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0003',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    testIds: ['T-LIPID'],
    testNames: ['Lipid Profile'],
    status: 'Pending',
    totalAmount: 500,
    gstPercent: 0,
    referringDoctor: 'Dr. Nick Riviera',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ORD-2026-0004',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    testIds: ['T-CBC', 'T-LIPID'],
    testNames: ['Complete Blood Count', 'Lipid Profile'],
    status: 'Pending',
    totalAmount: 850,
    gstPercent: 0,
    referringDoctor: 'Dr. Julius Hibbert',
    priority: 'STAT',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ORD-2026-0005',
    branchId: 'BR-MAIN',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    testIds: ['T-TSH'],
    testNames: ['Thyroid Stimulating Hormone'],
    status: 'Completed',
    totalAmount: 350,
    gstPercent: 0,
    referringDoctor: 'Dr. Nick Riviera',
    priority: 'Normal',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_INVOICES = [
  {
    id: 'INV-2026-0001',
    orderId: 'ORD-2026-0001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    amount: 650,
    paidAmount: 650,
    status: 'Paid',
    paymentMethod: 'Cash',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0002',
    orderId: 'ORD-2026-0002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    amount: 150,
    paidAmount: 0,
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0003',
    orderId: 'ORD-2026-0003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    amount: 500,
    paidAmount: 500,
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'INV-2026-0004',
    orderId: 'ORD-2026-0004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    amount: 850,
    paidAmount: 400,
    status: 'Partial',
    paymentMethod: 'UPI',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-2026-0005',
    orderId: 'ORD-2026-0005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    amount: 350,
    paidAmount: 350,
    status: 'Paid',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_SAMPLES = [
  {
    id: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    barcode: 'SMP-2026-0001',
    sampleType: 'EDTA Whole Blood',
    status: 'Completed',
    collectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0002',
    orderId: 'ORD-2026-0002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    barcode: 'SMP-2026-0002',
    sampleType: 'Fluoride Plasma',
    status: 'Received',
    collectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0003',
    orderId: 'ORD-2026-0003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    barcode: 'SMP-2026-0003',
    sampleType: 'Serum',
    status: 'Registered',
    collectedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'SMP-2026-0004',
    orderId: 'ORD-2026-0004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    barcode: 'SMP-2026-0004',
    sampleType: 'EDTA Whole Blood',
    status: 'Registered',
    collectedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'SMP-2026-0005',
    orderId: 'ORD-2026-0005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    barcode: 'SMP-2026-0005',
    sampleType: 'Serum',
    status: 'Completed',
    collectedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 17.5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_RESULTS = [
  {
    id: 'RES-2026-0001',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'T-CBC',
    testName: 'Complete Blood Count',
    value: '14.5',
    unit: 'g/dL',
    referenceRange: '13.0 - 17.0',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 22.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0002',
    sampleId: 'SMP-2026-0001',
    orderId: 'ORD-2026-0001',
    testId: 'T-TSH',
    testName: 'Thyroid Stimulating Hormone',
    value: '2.8',
    unit: 'uIU/mL',
    referenceRange: '0.4 - 4.5',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 22.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0003',
    sampleId: 'SMP-2026-0002',
    orderId: 'ORD-2026-0002',
    testId: 'T-FBS',
    testName: 'Fasting Blood Sugar',
    value: '110',
    unit: 'mg/dL',
    referenceRange: '70 - 100',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Pending',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RES-2026-0004',
    sampleId: 'SMP-2026-0005',
    orderId: 'ORD-2026-0005',
    testId: 'T-TSH',
    testName: 'Thyroid Stimulating Hormone',
    value: '1.9',
    unit: 'uIU/mL',
    referenceRange: '0.4 - 4.5',
    isCritical: false,
    queueStatus: 'Completed',
    approvalStatus: 'Approved',
    enteredBy: 'Lab Tech Alex',
    enteredAt: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Pathologist Jordan',
    approvedAt: new Date(Date.now() - 16.5 * 60 * 60 * 1000).toISOString(),
  }
];

const MOCK_APPOINTMENTS = [
  {
    id: 'APT-001',
    patientId: 'PAT-000001',
    patientName: 'John Doe',
    scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'Walk-In',
    status: 'Completed',
    orderId: 'ORD-2026-0001',
    testIds: ['T-CBC', 'T-TSH'],
    testNames: ['Complete Blood Count', 'Thyroid Stimulating Hormone'],
    orderTotal: 650,
  },
  {
    id: 'APT-002',
    patientId: 'PAT-000002',
    patientName: 'Sarah Connor',
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Completed',
    orderId: 'ORD-2026-0002',
    testIds: ['T-FBS'],
    testNames: ['Fasting Blood Sugar'],
    orderTotal: 150,
  },
  {
    id: 'APT-003',
    patientId: 'PAT-000003',
    patientName: 'Tony Stark',
    scheduledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Completed',
    orderId: 'ORD-2026-0003',
    testIds: ['T-LIPID'],
    testNames: ['Lipid Profile'],
    orderTotal: 500,
  },
  {
    id: 'APT-004',
    patientId: 'PAT-000004',
    patientName: 'Bruce Wayne',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    type: 'Scheduled',
    status: 'Scheduled',
    orderId: 'ORD-2026-0004',
    testIds: ['T-CBC', 'T-LIPID'],
    testNames: ['Complete Blood Count', 'Lipid Profile'],
    orderTotal: 850,
  },
  {
    id: 'APT-005',
    patientId: 'PAT-000005',
    patientName: 'Jane Smith',
    scheduledAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    type: 'Walk-In',
    status: 'Completed',
    orderId: 'ORD-2026-0005',
    testIds: ['T-TSH'],
    testNames: ['Thyroid Stimulating Hormone'],
    orderTotal: 350,
  }
];

export async function POST(request: Request) {
  try {
    if (!useRemoteDb()) {
      return jsonData(
        { message: 'Firebase is not configured.' },
        400,
      );
    }

    await ensureDb();
    const session = requireAuth(request);
    if (session.role !== 'Admin') {
      return jsonData({ message: 'Admin access required.' }, 403);
    }

    // 1. Force reseed master tables and wipe transactional tables
    const reseedResult = await forceReseed();

    // 2. Seed mock transactional data
    for (const patient of MOCK_PATIENTS) {
      await seedDocument('patients', patient.id, patient);
    }
    for (const order of MOCK_ORDERS) {
      await seedDocument('orders', order.id, order);
    }
    for (const invoice of MOCK_INVOICES) {
      await seedDocument('invoices', invoice.id, invoice);
    }
    for (const sample of MOCK_SAMPLES) {
      await seedDocument('samples', sample.id, sample);
    }
    for (const result of MOCK_RESULTS) {
      await seedDocument('results', result.id, result);
    }
    for (const appointment of MOCK_APPOINTMENTS) {
      await seedDocument('appointments', appointment.id, appointment);
    }

    return jsonData({
      message: 'Database fully reseeded with master and mock transactional data successfully.',
      details: reseedResult.message,
    });
  } catch (e) {
    return handleRouteError(e);
  }
}
