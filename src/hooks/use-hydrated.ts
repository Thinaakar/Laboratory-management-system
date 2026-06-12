'use client';

import { useEffect, useState } from 'react';

/** True only after the component has mounted on the client. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/** Load session-backed demo data after hydration to avoid SSR/client mismatches. */
export function useClientData<T>(loader: () => T): { data: T | null; ready: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loader());
    setReady(true);
    // Loader is intentionally run once after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, ready };
}
