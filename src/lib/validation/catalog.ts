import { z } from 'zod';

export const departmentCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

export const branchCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const sampleTypeCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const sampleTypeUpdateSchema = sampleTypeCreateSchema;

export const testCreateSchema = z.object({
  name: z.string().min(1),
  departmentId: z.string().min(1),
  sampleType: z.string().min(1),
  price: z.number().min(0),
  turnaroundHours: z.number().min(1),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const packageCreateSchema = z.object({
  name: z.string().min(1),
  testIds: z.array(z.string()).min(1),
  price: z.number().min(0),
  description: z.string().optional(),
});

export const referralCreateSchema = z.object({
  doctorName: z.string().min(1),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

const inventoryCategoryEnum = z.enum(['Reagent', 'Chemical', 'Test Kit', 'Consumable']);

export const inventoryCreateSchema = z.object({
  name: z.string().min(1),
  category: inventoryCategoryEnum,
  quantity: z.number().min(0),
  unit: z.string().min(1),
  reorderLevel: z.number().min(0),
  expiryDate: z.string().optional(),
  supplierId: z.string().optional(),
});

export const supplierCreateSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  email: z.string().email().optional(),
  gst: z.string().optional(),
});

const equipmentStatusEnum = z.enum(['Active', 'Maintenance', 'Retired']);

export const equipmentCreateSchema = z.object({
  name: z.string().min(1),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  lastCalibration: z.string().optional(),
  nextCalibrationDue: z.string().optional(),
  status: equipmentStatusEnum.default('Active'),
});

export const generalSettingsSchema = z.object({
  laboratoryName: z.string().min(1),
  contactPhone: z.string().min(1),
  email: z.string().email(),
  requirePathologistApproval: z.boolean().default(true),
  includeDigitalSignature: z.boolean().default(true),
});
