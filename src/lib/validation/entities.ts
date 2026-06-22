import { z } from 'zod';

const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
const genderEnum = z.enum(['Male', 'Female', 'Other']);
const patientTypeEnum = z.enum(['Walk-In', 'Scheduled', 'Corporate', 'Insurance', 'Camp']);
const orderPriorityEnum = z.enum(['Normal', 'Urgent', 'STAT']);
const appointmentTypeEnum = z.enum(['Scheduled', 'Walk-In']);
const paymentMethodEnum = z.enum(['Cash', 'UPI', 'Card']);
const sampleStatusEnum = z.enum([
  'Registered',
  'Collected',
  'Received',
  'Processing',
  'Completed',
  'Rejected',
]);
const orderStatusEnum = z.enum(['Pending', 'Collected', 'Processing', 'Completed', 'Cancelled']);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().min(1),
  bloodGroup: bloodGroupEnum,
  dateOfBirth: z.string().min(1),
  gender: genderEnum,
  address: z.string().min(1),
  patientType: patientTypeEnum,
  referredDoctor: z.string().optional(),
  branchId: z.string().optional(),
});

export const patientUpdateSchema = patientCreateSchema;

/** @deprecated use patientCreateSchema */
export const patientCreateSchemaLegacy = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  bloodGroup: bloodGroupEnum.optional(),
  dateOfBirth: z.string().min(1),
  gender: genderEnum,
  address: z.string().optional(),
  branchId: z.string().optional(),
});

export const leadCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(['contact', 'demo', 'pricing']).default('contact'),
});

export const orderCreateSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  testIds: z.array(z.string()).min(1),
  testNames: z.array(z.string()).min(1),
  totalAmount: z.number().min(0),
  referringDoctor: z.string().optional(),
  priority: orderPriorityEnum.optional(),
  healthPackageId: z.string().optional(),
  healthPackageName: z.string().optional(),
  branchId: z.string().optional(),
});

export const orderUpdateSchema = z.object({
  status: orderStatusEnum.optional(),
  priority: orderPriorityEnum.optional(),
});

export const invoiceCreateSchema = z.object({
  orderId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  amount: z.number().min(0),
});

export const invoicePaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: paymentMethodEnum,
});

export const appointmentCreateSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  scheduledAt: z.string().min(1),
  type: appointmentTypeEnum,
  notes: z.string().optional(),
  referringDoctor: z.string().optional(),
  priority: orderPriorityEnum.optional(),
  healthPackageId: z.string().optional(),
  healthPackageName: z.string().optional(),
  testIds: z.array(z.string()).min(1),
  testNames: z.array(z.string()).min(1),
  orderTotal: z.number().min(0),
  packageSelection: z.string().min(1),
});

export const appointmentUpdateSchema = z.object({
  scheduledAt: z.string().optional(),
  type: appointmentTypeEnum.optional(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No-Show']).optional(),
  notes: z.string().optional(),
  referringDoctor: z.string().optional(),
  priority: orderPriorityEnum.optional(),
});

export const sampleCreateSchema = z.object({
  orderId: z.string().min(1),
  sampleType: z.string().min(1),
  barcode: z.string().min(1),
  collectedAt: z.string().min(1),
});

export const sampleUpdateSchema = z.object({
  sampleType: z.string().min(1),
  status: sampleStatusEnum,
  collectedAt: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const resultEnterSchema = z.object({
  resultId: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  isCritical: z.boolean().optional(),
});

export const resultUpdateSchema = z.object({
  value: z.string().min(1),
  unit: z.string().optional(),
  isCritical: z.boolean().optional(),
  queueStatus: z.enum(['Pending', 'Assigned', 'Processing', 'Completed']).optional(),
});

export const resultRejectSchema = z.object({
  pathologistNotes: z.string().optional(),
});

export const analyticsPeriodSchema = z.enum(['overall', 'monthly', 'weekly', 'daily']);

const userStatusEnum = z.enum(['Active', 'Inactive']);
const roleStatusEnum = z.enum(['Active', 'Inactive']);

import { USER_DEPARTMENT_OPTIONS } from '@/lib/data/user-constants';

const userDepartmentEnum = z.enum(USER_DEPARTMENT_OPTIONS);

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(32)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Username may only contain letters, numbers, dots, hyphens, and underscores');

export const userCreateSchema = z.object({
  displayName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  mobile: z.string().min(10, 'Mobile number is required'),
  username: usernameSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  branchId: z.string().optional(),
  department: userDepartmentEnum.optional(),
  status: userStatusEnum.default('Active'),
});

export const userUpdateSchema = z.object({
  displayName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  mobile: z.string().min(10, 'Mobile number is required'),
  username: usernameSchema,
  password: z.string().min(6).optional(),
  role: z.string().min(1, 'Role is required'),
  branchId: z.string().optional(),
  department: userDepartmentEnum.optional(),
  status: userStatusEnum,
});

export const roleCreateSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  status: roleStatusEnum.default('Active'),
  color: z.string().min(1),
  permissions: z.array(z.string()).default(['dashboard.read']),
});

export const roleUpdateSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  status: roleStatusEnum,
  color: z.string().min(1),
});

export const rolePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});
