'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function InventoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/inventory');
  }, [router]);

  return null;
}

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryRedirect />
    </Suspense>
  );
}
