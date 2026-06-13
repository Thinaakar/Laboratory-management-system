'use client';

import { useEffect, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseDataTableOptions<T> {
  data: T[];
  searchQuery?: string;
  searchFilter?: (item: T, query: string) => boolean;
  sortFn?: (a: T, b: T, key: string, direction: SortDirection) => number;
  pageSize?: number;
}

export function useDataTable<T>({
  data,
  searchQuery = '',
  searchFilter,
  sortFn,
  pageSize: initialPageSize = 10,
}: UseDataTableOptions<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  useEffect(() => {
    setPage(1);
  }, [searchQuery, data.length]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !searchFilter) return data;
    return data.filter((item) => searchFilter(item, q));
  }, [data, searchQuery, searchFilter]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortFn) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => sortFn(a, b, sortKey, sortDir));
    return copy;
  }, [filtered, sortKey, sortDir, sortFn]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, safePage, pageSize]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const goToPage = (next: number) => {
    setPage(Math.max(1, Math.min(totalPages, next)));
  };

  return {
    rows,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    sortKey,
    sortDir,
    setPage: goToPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    toggleSort,
  };
}

export function defaultStringSort<T>(
  a: T,
  b: T,
  key: string,
  direction: SortDirection,
  accessor: (item: T, key: string) => string | number,
): number {
  const av = accessor(a, key);
  const bv = accessor(b, key);
  const cmp =
    typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
  return direction === 'asc' ? cmp : -cmp;
}
