/** LIMS navigation — workflow-first module groups. */

export interface NavItem {
  label: string;
  href: string;
  permission?: string;
  /** Show item if user has any of these permissions */
  permissions?: string[];
  /** Pipeline step number (1–7) for daily workflow items */
  step?: number;
  /** Extra paths that should highlight this nav item */
  activePaths?: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  /** Show step badges in sidebar for this group */
  isWorkflow?: boolean;
}

/** Shared pipeline — used by sidebar + workflow strip */
export const WORKFLOW_STEPS: NavItem[] = [
  { step: 1, label: 'Patients', href: '/patients', permission: 'patients.read' },
  { step: 2, label: 'Appointments', href: '/appointments', permission: 'appointments.read', activePaths: ['/appointments/new'] },
  { step: 3, label: 'Billing', href: '/billing', permission: 'billing.read' },
  { step: 4, label: 'Samples', href: '/samples', permission: 'samples.read' },
  {
    step: 5,
    label: 'Results',
    href: '/results',
    permission: 'results.read',
    activePaths: ['/results', '/results/entry', '/lab-queue'],
  },
  { step: 6, label: 'Report Approval', href: '/reports/approval', permission: 'reports.approve' },
  { step: 7, label: 'Reports', href: '/reports', permission: 'reports.read' },
];

export const LIMS_NAV: NavGroup[] = [
  {
    title: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', permission: 'dashboard.read' }],
  },
  {
    title: 'Daily Workflow',
    isWorkflow: true,
    items: WORKFLOW_STEPS,
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Analytics',
        href: '/analytics',
        permission: 'analytics.read',
        activePaths: ['/analytics'],
        // activePaths: ['/analytics', '/referrals'], // referrals temporarily hidden
      },
      {
        label: 'User Management',
        href: '/admin/users',
        permissions: ['users.read', 'audit.read'],
        activePaths: ['/admin/users', '/admin/roles', '/admin/permissions', '/admin/audit'],
      },
      {
        label: 'Settings',
        href: '/settings',
        permissions: ['settings.read', 'tests.read', 'inventory.read', 'equipment.read'],
        activePaths: [
          '/settings',
          '/settings/general',
          '/settings/tests',
          '/settings/packages',
          '/settings/departments',
          '/settings/doctors',
          '/settings/branches',
          '/settings/inventory',
          '/settings/suppliers',
          '/settings/equipment',
          '/tests',
          '/tests/packages',
          '/admin/branches',
          '/inventory',
          '/suppliers',
          '/equipment',
        ],
      },
    ],
  },
];

export const MARKETING_NAV = [
  { label: 'Features', href: '/features' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'Pricing', href: '/pricing' },
  // { label: 'Blog', href: '/blog' }, // temporarily hidden
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

/** Short labels for compact workflow strip */
export const WORKFLOW_STRIP_LABELS: Record<string, string> = {
  '/patients': 'Register',
  '/appointments': 'Schedule',
  '/billing': 'Invoice',
  '/samples': 'Sample',
  '/results': 'Results',
  '/reports/approval': 'Approve',
  '/reports': 'Report',
};
