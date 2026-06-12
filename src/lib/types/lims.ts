/** LabCore LIMS — domain types (SaaS-ready, branch-aware). */

export type UserRole = 'Admin' | 'Receptionist' | 'Lab Technician' | 'Pathologist';

export type OrderStatus = 'Pending' | 'Collected' | 'Processing' | 'Completed' | 'Cancelled';
export type SampleStatus =
  | 'Registered'
  | 'Collected'
  | 'Received'
  | 'Processing'
  | 'Completed'
  | 'Rejected';
export type LabQueueStatus = 'Pending' | 'Assigned' | 'Processing' | 'Completed';
export type ReportApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';
export type InvoiceStatus = 'Paid' | 'Partial' | 'Pending' | 'Cancelled';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

export type PatientType = 'Walk-In' | 'Scheduled' | 'Corporate' | 'Insurance' | 'Camp';

export interface Patient {
  id: string;
  branchId?: string;
  firstName: string;
  lastName?: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  age?: number;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  referredDoctor?: string;
  patientType?: PatientType;
  createdAt: string;
}

export interface TestDepartment {
  id: string;
  name: string;
  code: string;
}

export interface LabTest {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  price: number;
  sampleType: string;
  turnaroundHours: number;
  unit?: string;
  referenceRange?: string;
  isActive: boolean;
}

export interface HealthPackage {
  id: string;
  name: string;
  testIds: string[];
  price: number;
  description?: string;
}

export interface LabOrder {
  id: string;
  branchId?: string;
  patientId: string;
  patientName: string;
  testIds: string[];
  testNames: string[];
  status: OrderStatus;
  totalAmount: number;
  discount?: number;
  gstPercent?: number;
  createdAt: string;
  createdBy?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  amount: number;
  paidAmount: number;
  status: InvoiceStatus;
  paymentMethod?: 'Cash' | 'UPI' | 'Card';
  createdAt: string;
}

export interface Sample {
  id: string;
  orderId: string;
  patientId: string;
  patientName: string;
  barcode: string;
  sampleType: string;
  status: SampleStatus;
  rejectionReason?: string;
  collectedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  sampleId: string;
  orderId: string;
  testId: string;
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isCritical?: boolean;
  queueStatus: LabQueueStatus;
  enteredBy?: string;
  enteredAt?: string;
  approvalStatus: ReportApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  pathologistNotes?: string;
}

export interface ResultRevision {
  id: string;
  resultId: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  ipAddress?: string;
  timestamp: string;
  details?: string;
}

export interface DashboardKpis {
  totalPatients: number;
  todayRegistrations: number;
  todaySamples: number;
  pendingTests: number;
  completedReports: number;
  revenueToday: number;
  monthlyRevenue: number;
  outstandingPayments: number;
}

export interface MarketingLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  source: 'contact' | 'demo' | 'pricing';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  type: 'Scheduled' | 'Walk-In';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Reagent' | 'Chemical' | 'Test Kit' | 'Consumable';
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate?: string;
  supplierId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  gst?: string;
  totalPurchases: number;
}

export interface Equipment {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  lastCalibration?: string;
  nextCalibrationDue?: string;
  status: 'Active' | 'Maintenance' | 'Retired';
}

export interface DoctorReferral {
  id: string;
  doctorName: string;
  specialty?: string;
  phone?: string;
  referralCount: number;
  revenueGenerated: number;
}

export interface LimsUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  branchId?: string;
  createdAt: string;
}
