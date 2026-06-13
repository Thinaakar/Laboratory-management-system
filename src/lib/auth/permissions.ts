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
  { id: 'tests.read', module: 'Settings — Master Data', action: 'read', label: 'View tests, packages & catalog' },
  { id: 'tests.create', module: 'Settings — Master Data', action: 'create', label: 'Add tests & packages' },
  { id: 'tests.update', module: 'Settings — Master Data', action: 'update', label: 'Edit master data catalog' },
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
  { id: 'inventory.read', module: 'Settings — Stocks', action: 'read', label: 'View inventory & suppliers' },
  { id: 'inventory.create', module: 'Settings — Stocks', action: 'create', label: 'Manage inventory & suppliers' },
  { id: 'equipment.read', module: 'Settings — Stocks', action: 'read', label: 'View equipment' },
  { id: 'equipment.update', module: 'Settings — Stocks', action: 'update', label: 'Maintenance & calibration' },
  { id: 'analytics.read', module: 'Analytics', action: 'read', label: 'View analytics' },
  { id: 'users.read', module: 'User Management', action: 'read', label: 'View users & roles' },
  { id: 'users.create', module: 'User Management', action: 'create', label: 'Manage users & roles' },
  { id: 'users.update', module: 'User Management', action: 'update', label: 'Edit permissions' },
  { id: 'audit.read', module: 'User Management', action: 'read', label: 'View audit logs' },
  { id: 'settings.read', module: 'Settings — General', action: 'read', label: 'View general lab settings' },
  { id: 'settings.update', module: 'Settings — General', action: 'update', label: 'Update general lab settings' },
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
