'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function TestsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/tests');
  }, [router]);

  return null;
}

export default function TestsPage() {
  return (
    <Suspense fallback={null}>
      <TestsRedirect />
    </Suspense>
  );
}
