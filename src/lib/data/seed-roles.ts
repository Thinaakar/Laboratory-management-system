import { ALL_PERMISSION_IDS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import type { LimsRole } from '@/lib/data/roles-store';

/** Default roles seeded into Firestore on first init. */
export const SEED_ROLES: LimsRole[] = [
  {
    id: 'role-admin',
    name: 'Admin',
    label: 'Admin',
    description: 'Full system access including roles, permissions, and lab settings.',
    permissions: [...ALL_PERMISSION_IDS],
    color: 'primary',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-receptionist',
    name: 'Receptionist',
    label: 'Receptionist',
    description: 'Front desk — patients, appointments, orders, billing, and sample registration.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS.Receptionist ?? [])],
    color: 'blue',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-lab-tech',
    name: 'Lab Technician',
    label: 'Lab Technician',
    description: 'Sample processing, result entry, and inventory visibility.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS['Lab Technician'] ?? [])],
    color: 'emerald',
    status: 'Active',
    isSystem: true,
  },
  {
    id: 'role-pathologist',
    name: 'Pathologist',
    label: 'Pathologist',
    description: 'Result review, report approval, and analytics.',
    permissions: [...(DEFAULT_ROLE_PERMISSIONS.Pathologist ?? [])],
    color: 'violet',
    status: 'Active',
    isSystem: true,
  },
];
