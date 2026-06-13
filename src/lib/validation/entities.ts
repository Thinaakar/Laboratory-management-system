import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patientCreateSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['Male', 'Female', 'Other']),
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
