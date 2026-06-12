'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LabQueueRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('filter', 'pending');
    const success = searchParams.get('success');
    if (success) {
      next.set('success', success);
    }
    router.replace(`/results?${next.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function LabQueuePage() {
  return (
    <Suspense fallback={null}>
      <LabQueueRedirect />
    </Suspense>
  );
}
