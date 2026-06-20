'use client';

import { ArrowLeft, ClipboardList, Wallet } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CollectPaymentModal } from '@/components/lims/billing/collect-payment-modal';
import { InvoiceDetailModal } from '@/components/lims/billing/invoice-detail-modal';
import { DataTable } from '@/components/lims/data-table';
import { ModuleHub } from '@/components/lims/module-hub';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { TableRowActions } from '@/components/lims/table-row-actions';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getLimsData } from '@/lib/api/use-lims-data';
import type { Invoice } from '@/lib/types/lims';
import { formatCurrency, formatDateTime } from '@/lib/utils';

type BillingView = 'hub' | 'list';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<BillingView>('hub');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [initialInvoiceId, setInitialInvoiceId] = useState<string | undefined>();
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = useCallback(async () => {
    const api = await getLimsData();
    setInvoices(await api.invoices.list());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (searchParams.get('collect') === '1') {
      setInitialInvoiceId(searchParams.get('invoiceId') ?? undefined);
      setShowModal(true);
      window.history.replaceState(null, '', '/billing');
    }
  }, [searchParams]);

  const filteredData = useMemo(
    () => invoices.filter((inv) => statusFilter === 'all' || inv.status === statusFilter),
    [invoices, statusFilter],
  );

  const rowActions = useCallback(
    (inv: Invoice) => (
      <TableRowActions
        onView={() => setViewInvoice(inv)}
        viewLabel={`View invoice ${inv.id}`}
      />
    ),
    [],
  );

  const searchFilter = useCallback((inv: Invoice, q: string) => {
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.orderId.toLowerCase().includes(q) ||
      inv.patientId.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.status.toLowerCase().includes(q) ||
      (inv.paymentMethod?.toLowerCase().includes(q) ?? false)
    );
  }, []);

  const sortFn = useCallback((a: Invoice, b: Invoice, key: string, dir: 'asc' | 'desc') => {
    const accessor = (inv: Invoice, k: string) => {
      switch (k) {
        case 'id':
          return inv.id;
        case 'patient':
          return inv.patientName;
        case 'amount':
          return inv.amount;
        case 'status':
          return inv.status;
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({ data: filteredData, searchQuery: search, searchFilter, sortFn, pageSize: 10 });

  const columns = useMemo(
    () => [
      { key: 'id', header: 'Invoice ID', sortable: true, className: 'font-mono text-xs text-slate-600', render: (inv: Invoice) => inv.id, exportValue: (inv: Invoice) => inv.id },
      { key: 'patient', header: 'Patient', sortable: true, className: 'font-medium text-slate-900', render: (inv: Invoice) => inv.patientName, exportValue: (inv: Invoice) => inv.patientName },
      { key: 'amount', header: 'Amount', sortable: true, render: (inv: Invoice) => formatCurrency(inv.amount), exportValue: (inv: Invoice) => inv.amount },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        exportValue: (inv: Invoice) => inv.status,
        render: (inv: Invoice) => <StatusBadge label={inv.status} variant={statusVariant(inv.status)} />,
      },
      { key: 'actions', header: '', className: 'w-14', render: rowActions },
    ],
    [rowActions],
  );

  const statusOptions = useMemo(() => [...new Set(invoices.map((i) => i.status))].sort(), [invoices]);

  return (
    <div className="patients-module">
      <FlashBanner />
      {successMessage && (
        <div className="mb-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {view === 'hub' && (
        <ModuleHub
          eyebrow="Billing & Payments"
          title="Billing"
          description="Record payments, manage invoices, and track outstanding balances."
          actions={[
            {
              id: 'collect',
              label: 'Collect Payment',
              description: 'Record a payment against an invoice and update billing status.',
              icon: Wallet,
              ctaLabel: 'Collect Payment',
              onSelect: () => {
                setInitialInvoiceId(undefined);
                setShowModal(true);
              },
            },
            {
              id: 'list',
              label: 'Invoice List',
              description: 'Review all invoices, payment history, and outstanding balances.',
              icon: ClipboardList,
              ctaLabel: 'View Invoices',
              variant: 'secondary',
              onSelect: () => setView('list'),
            },
          ]}
          activityTitle="Recent Billing Activity"
          activitySubtitle="Latest invoices and payment records"
          activityEmptyMessage="No invoices found. Collect payment to get started."
          items={invoices}
          rowKey={(inv) => inv.id}
          sortDate={(inv) => inv.createdAt}
          onViewAll={() => setView('list')}
          renderRowActions={rowActions}
          columns={[
            { key: 'id', header: 'Invoice', className: 'font-mono text-xs text-slate-600', render: (inv) => inv.id },
            { key: 'patient', header: 'Patient', className: 'font-medium text-slate-900', render: (inv) => inv.patientName },
            { key: 'amount', header: 'Amount', className: 'text-slate-900', render: (inv) => formatCurrency(inv.amount) },
            {
              key: 'status',
              header: 'Status',
              render: (inv) => <StatusBadge label={inv.status} variant={statusVariant(inv.status)} />,
            },
            { key: 'created', header: 'Created', className: 'text-slate-600', render: (inv) => formatDateTime(inv.createdAt) },
          ]}
        />
      )}

      {view === 'list' && (
        <>
          <PageHeader
            title="Invoice List"
            description="Browse invoices — click the eye icon to view details"
            action={
              <button type="button" onClick={() => setView('hub')} className="lims-btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            }
          />
          <DataTable
            columns={columns}
            data={table.rows}
            rowKey={(inv) => inv.id}
            emptyMessage={invoices.length === 0 ? 'No invoices found.' : 'No invoices match your filters.'}
            search={{ value: search, onChange: setSearch, placeholder: 'Search by invoice, order, patient, or status…' }}
            filters={
              <select className="lims-input h-9 w-auto min-w-[8rem] text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            }
            sortKey={table.sortKey}
            sortDir={table.sortDir}
            onSort={table.toggleSort}
            pagination={{
              page: table.page,
              pageSize: table.pageSize,
              totalItems: table.totalItems,
              totalPages: table.totalPages,
              onPageChange: table.setPage,
              onPageSizeChange: table.setPageSize,
            }}
            download={{ filename: 'invoices', data: table.allRows }}
          />
        </>
      )}

      {showModal && (
        <CollectPaymentModal
          initialInvoiceId={initialInvoiceId}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            refresh();
            setShowModal(false);
            router.push('/samples?register=1&success=payment');
          }}
        />
      )}
      {viewInvoice && <InvoiceDetailModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
