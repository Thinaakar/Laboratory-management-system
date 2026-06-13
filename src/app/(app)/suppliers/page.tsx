'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SuppliersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/suppliers');
  }, [router]);

  return null;
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={null}>
      <SuppliersRedirect />
    </Suspense>
  );
}
