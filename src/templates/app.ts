export type TemplateFieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'reference';

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  refTable?: string;
};

export type TemplateTable = {
  key: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

/** LabCore LIMS — Firestore table definitions (templates/app/tables/...) */
export const appTemplate = {
  key: 'lims',
  label: 'LabCore LIMS',
  tables: [
    {
      key: 'branches',
      label: 'Branches',
      order: 5,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'code', label: 'Code', type: 'string', required: true },
        { key: 'isActive', label: 'Active', type: 'boolean', required: true },
      ],
    },
    {
      key: 'users',
      label: 'Users',
      order: 10,
      fields: [
        { key: 'displayName', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'role', label: 'Role', type: 'string', required: true },
        { key: 'branchId', label: 'Branch', type: 'reference', refTable: 'branches' },
        { key: 'createdAt', label: 'Created', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'patients',
      label: 'Patients',
      order: 20,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'phone', label: 'Phone', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string' },
        { key: 'dateOfBirth', label: 'DOB', type: 'string', required: true },
        { key: 'gender', label: 'Gender', type: 'string', required: true },
        { key: 'branchId', label: 'Branch', type: 'reference', refTable: 'branches' },
      ],
    },
    {
      key: 'departments',
      label: 'Departments',
      order: 25,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'code', label: 'Code', type: 'string', required: true },
      ],
    },
    {
      key: 'tests',
      label: 'Test Catalog',
      order: 30,
      fields: [
        { key: 'name', label: 'Test Name', type: 'string', required: true },
        { key: 'departmentId', label: 'Department', type: 'reference', refTable: 'departments' },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'sampleType', label: 'Sample Type', type: 'string', required: true },
        { key: 'turnaroundHours', label: 'TAT Hours', type: 'number', required: true },
      ],
    },
    {
      key: 'orders',
      label: 'Orders',
      order: 40,
      fields: [
        { key: 'patientId', label: 'Patient', type: 'reference', refTable: 'patients', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'totalAmount', label: 'Total', type: 'number', required: true },
        { key: 'branchId', label: 'Branch', type: 'reference', refTable: 'branches' },
      ],
    },
    {
      key: 'samples',
      label: 'Samples',
      order: 50,
      fields: [
        { key: 'orderId', label: 'Order', type: 'reference', refTable: 'orders', required: true },
        { key: 'barcode', label: 'Barcode', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'rejectionReason', label: 'Rejection Reason', type: 'string' },
      ],
    },
    {
      key: 'results',
      label: 'Results',
      order: 60,
      fields: [
        { key: 'sampleId', label: 'Sample', type: 'reference', refTable: 'samples', required: true },
        { key: 'testId', label: 'Test', type: 'reference', refTable: 'tests', required: true },
        { key: 'value', label: 'Value', type: 'string', required: true },
        { key: 'approvalStatus', label: 'Approval', type: 'string', required: true },
      ],
    },
    {
      key: 'invoices',
      label: 'Invoices',
      order: 70,
      fields: [
        { key: 'orderId', label: 'Order', type: 'reference', refTable: 'orders', required: true },
        { key: 'amount', label: 'Amount', type: 'number', required: true },
        { key: 'paidAmount', label: 'Paid', type: 'number', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
      ],
    },
    {
      key: 'audit_logs',
      label: 'Audit Logs',
      order: 90,
      fields: [
        { key: 'userId', label: 'User', type: 'reference', refTable: 'users', required: true },
        { key: 'action', label: 'Action', type: 'string', required: true },
        { key: 'module', label: 'Module', type: 'string', required: true },
        { key: 'timestamp', label: 'Timestamp', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'leads',
      label: 'Marketing Leads',
      order: 100,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'source', label: 'Source', type: 'string', required: true },
      ],
    },
  ],
} as const;
