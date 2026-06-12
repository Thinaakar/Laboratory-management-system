'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function PackagesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/packages');
  }, [router]);

  return null;
}

export default function HealthPackagesPage() {
  return (
    <Suspense fallback={null}>
      <PackagesRedirect />
    </Suspense>
  );
}
