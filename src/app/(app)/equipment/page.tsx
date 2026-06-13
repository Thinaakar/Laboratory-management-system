'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function EquipmentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/equipment');
  }, [router]);

  return null;
}

export default function EquipmentPage() {
  return (
    <Suspense fallback={null}>
      <EquipmentRedirect />
    </Suspense>
  );
}
