'use client';

import { ArrowLeft, ClipboardList, Wallet } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CollectPaymentModal } from '@/components/lims/billing/collect-payment-modal';
import { DataTable } from '@/components/lims/data-table';
import { ModuleActionHub } from '@/components/lims/module-action-hub';
import { PageHeader } from '@/components/lims/page-header';
import { FlashBanner } from '@/components/lims/flash-banner';
import { StatusBadge, statusVariant } from '@/components/lims/status-badge';
import { defaultStringSort, useDataTable } from '@/hooks/use-data-table';
import { getInvoices } from '@/lib/data/store';
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

  const refresh = useCallback(() => {
    setInvoices(getInvoices());
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

  const filteredData = useMemo(() => {
    return invoices.filter((inv) => statusFilter === 'all' || inv.status === statusFilter);
  }, [invoices, statusFilter]);

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
        case 'orderId':
          return inv.orderId;
        case 'patient':
          return inv.patientName;
        case 'patientId':
          return inv.patientId;
        case 'amount':
          return inv.amount;
        case 'paid':
          return inv.paidAmount;
        case 'due':
          return inv.amount - inv.paidAmount;
        case 'method':
          return inv.paymentMethod ?? '';
        case 'status':
          return inv.status;
        case 'created':
          return inv.createdAt;
        default:
          return '';
      }
    };
    return defaultStringSort(a, b, key, dir, accessor);
  }, []);

  const table = useDataTable({
    data: filteredData,
    searchQuery: search,
    searchFilter,
    sortFn,
    pageSize: 10,
  });

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: 'Invoice ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (inv: Invoice) => inv.id,
      },
      {
        key: 'orderId',
        header: 'Order ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (inv: Invoice) => inv.orderId,
      },
      {
        key: 'patient',
        header: 'Patient',
        sortable: true,
        className: 'font-medium text-slate-900',
        render: (inv: Invoice) => inv.patientName,
      },
      {
        key: 'patientId',
        header: 'Patient ID',
        sortable: true,
        className: 'font-mono text-xs text-slate-600',
        render: (inv: Invoice) => inv.patientId,
      },
      {
        key: 'amount',
        header: 'Amount',
        sortable: true,
        render: (inv: Invoice) => formatCurrency(inv.amount),
      },
      {
        key: 'paid',
        header: 'Paid',
        sortable: true,
        render: (inv: Invoice) => formatCurrency(inv.paidAmount),
      },
      {
        key: 'due',
        header: 'Due',
        sortable: true,
        render: (inv: Invoice) => {
          const due = inv.amount - inv.paidAmount;
          return <span className={due > 0 ? 'font-medium text-slate-900' : ''}>{formatCurrency(due)}</span>;
        },
      },
      {
        key: 'method',
        header: 'Method',
        sortable: true,
        render: (inv: Invoice) => inv.paymentMethod ?? '—',
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (inv: Invoice) => <StatusBadge label={inv.status} variant={statusVariant(inv.status)} />,
      },
      {
        key: 'created',
        header: 'Created',
        sortable: true,
        render: (inv: Invoice) => formatDateTime(inv.createdAt),
      },
    ],
    [],
  );

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(invoices.map((i) => i.status))];
    return statuses.sort();
  }, [invoices]);

  const openCollectModal = () => {
    setInitialInvoiceId(undefined);
    setShowModal(true);
  };

  return (
    <>
      <PageHeader
        title="Billing"
        description="Invoices and payment tracking"
        action={
          view !== 'hub' ? (
            <button type="button" onClick={() => setView('hub')} className="lims-btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : undefined
        }
      />

      <FlashBanner />

      {view === 'hub' && (
        <ModuleActionHub
          actions={[
            {
              id: 'collect',
              label: 'Collect Payment',
              description: 'Record a payment against an invoice and update billing status.',
              icon: Wallet,
              onSelect: openCollectModal,
            },
            {
              id: 'list',
              label: 'Invoice List',
              description: 'Review all invoices, payment history, and outstanding balances.',
              icon: ClipboardList,
              onSelect: () => setView('list'),
            },
          ]}
        />
      )}

      {view === 'list' && (
        <DataTable
          columns={columns}
          data={table.rows}
          rowKey={(inv) => inv.id}
          emptyMessage={
            invoices.length === 0
              ? 'No invoices found. Collect payment to get started.'
              : 'No invoices match your filters.'
          }
          search={{
            value: search,
            onChange: setSearch,
            placeholder: 'Search by invoice, order, patient, or status…',
          }}
          filters={
            <select
              className="lims-input h-9 w-auto min-w-[8rem] text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
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
        />
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
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
