/** LIMS permission catalog — SaaS-ready RBAC. */

export interface PermissionDef {
  id: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve';
  label: string;
}

export const LIMS_PERMISSIONS: PermissionDef[] = [
  { id: 'dashboard.read', module: 'Dashboard', action: 'read', label: 'View dashboard' },
  { id: 'patients.read', module: 'Patients', action: 'read', label: 'View patients' },
  { id: 'patients.create', module: 'Patients', action: 'create', label: 'Register patients' },
  { id: 'patients.update', module: 'Patients', action: 'update', label: 'Edit patients' },
  { id: 'appointments.read', module: 'Appointments', action: 'read', label: 'View appointments' },
  { id: 'appointments.create', module: 'Appointments', action: 'create', label: 'Schedule appointments' },
  { id: 'appointments.update', module: 'Appointments', action: 'update', label: 'Reschedule / cancel' },
  { id: 'tests.read', module: 'Test Catalog', action: 'read', label: 'View tests & packages' },
  { id: 'tests.create', module: 'Test Catalog', action: 'create', label: 'Manage tests & packages' },
  { id: 'tests.update', module: 'Test Catalog', action: 'update', label: 'Edit test catalog' },
  { id: 'orders.read', module: 'Orders', action: 'read', label: 'View orders' },
  { id: 'orders.create', module: 'Orders', action: 'create', label: 'Create orders' },
  { id: 'orders.update', module: 'Orders', action: 'update', label: 'Update order status' },
  { id: 'billing.read', module: 'Billing', action: 'read', label: 'View invoices' },
  { id: 'billing.create', module: 'Billing', action: 'create', label: 'Generate invoices' },
  { id: 'billing.update', module: 'Billing', action: 'update', label: 'Record payments' },
  { id: 'samples.read', module: 'Samples', action: 'read', label: 'View samples' },
  { id: 'samples.create', module: 'Samples', action: 'create', label: 'Register & collect samples' },
  { id: 'samples.update', module: 'Samples', action: 'update', label: 'Update sample status' },
  { id: 'results.read', module: 'Results', action: 'read', label: 'View results' },
  { id: 'results.create', module: 'Results', action: 'create', label: 'Enter results' },
  { id: 'results.update', module: 'Results', action: 'update', label: 'Revise results' },
  { id: 'reports.read', module: 'Reports', action: 'read', label: 'View reports' },
  { id: 'reports.approve', module: 'Reports', action: 'approve', label: 'Approve / reject reports' },
  { id: 'inventory.read', module: 'Inventory', action: 'read', label: 'View inventory' },
  { id: 'inventory.create', module: 'Inventory', action: 'create', label: 'Manage inventory' },
  { id: 'equipment.read', module: 'Equipment', action: 'read', label: 'View equipment' },
  { id: 'equipment.update', module: 'Equipment', action: 'update', label: 'Maintenance & calibration' },
  { id: 'analytics.read', module: 'Analytics', action: 'read', label: 'View analytics' },
  { id: 'users.read', module: 'Administration', action: 'read', label: 'View users & roles' },
  { id: 'users.create', module: 'Administration', action: 'create', label: 'Manage users & roles' },
  { id: 'users.update', module: 'Administration', action: 'update', label: 'Edit permissions' },
  { id: 'settings.read', module: 'Settings', action: 'read', label: 'View settings' },
  { id: 'settings.update', module: 'Settings', action: 'update', label: 'Update lab settings' },
  { id: 'audit.read', module: 'Audit', action: 'read', label: 'View audit logs' },
];

export const ALL_PERMISSION_IDS = LIMS_PERMISSIONS.map((p) => p.id);

export function permissionsByModule(): Record<string, PermissionDef[]> {
  return LIMS_PERMISSIONS.reduce<Record<string, PermissionDef[]>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ALL_PERMISSION_IDS,
  Receptionist: [
    'dashboard.read', 'patients.read', 'patients.create', 'patients.update',
    'appointments.read', 'appointments.create', 'appointments.update',
    'tests.read', 'orders.read', 'orders.create', 'orders.update',
    'billing.read', 'billing.create', 'billing.update', 'samples.read',
  ],
  'Lab Technician': [
    'dashboard.read', 'patients.read', 'orders.read', 'samples.read', 'samples.create', 'samples.update',
    'results.read', 'results.create', 'results.update', 'inventory.read',
  ],
  Pathologist: [
    'dashboard.read', 'patients.read', 'orders.read', 'samples.read',
    'results.read', 'reports.read', 'reports.approve', 'analytics.read',
  ],
};

export function hasPermission(rolePermissions: string[], permissionId: string): boolean {
  if (rolePermissions.includes('*') || rolePermissions.includes(permissionId)) return true;
  const [module] = permissionId.split('.');
  return rolePermissions.includes(`${module}.*`);
}
