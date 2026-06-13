'use client';

import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Search } from 'lucide-react';
import { HydrationSafeInput } from '@/components/lims/client-only';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  filters?: React.ReactNode;
  sortKey?: string | null;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  className?: string;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'No records found.',
  search,
  filters,
  sortKey,
  sortDir,
  onSort,
  pagination,
  className,
  stickyHeader = true,
}: DataTableProps<T>) {
  const start = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const end = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.totalItems)
    : data.length;

  return (
    <div className={cn('lims-table-card', className)}>
      {(search || filters) && (
        <div className="lims-table-toolbar">
          {search && (
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <HydrationSafeInput
                type="search"
                className="lims-input pl-9"
                placeholder={search.placeholder ?? 'Search…'}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
        </div>
      )}

      <div className={cn('lims-table-scroll', stickyHeader && 'lims-table-scroll-sticky')}>
        <table className="lims-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName}>
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="lims-table-sort-btn"
                      aria-sort={
                        sortKey === col.key
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <span>{col.header}</span>
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? (
                          <ChevronUp size={14} className="shrink-0 text-primary" />
                        ) : (
                          <ChevronDown size={14} className="shrink-0 text-primary" />
                        )
                      ) : (
                        <ChevronsUpDown size={14} className="shrink-0 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="lims-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalItems > 0 && (
        <div className="lims-table-footer">
          <p className="lims-table-meta">
            Showing {start}–{end} of {pagination.totalItems.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-3">
            {pagination.onPageSizeChange && (
              <label className="flex items-center gap-2 text-xs text-muted">
                Rows
                <select
                  className="lims-input h-8 w-[4.5rem] py-1 text-xs"
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                >
                  {[10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="lims-pagination-btn"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[4.5rem] text-center text-xs font-medium text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                className="lims-pagination-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
