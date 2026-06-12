'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function EnterResultsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/results?filter=pending&entry=1');
  }, [router]);

  return null;
}

export default function EnterResultsPage() {
  return (
    <Suspense fallback={null}>
      <EnterResultsRedirect />
    </Suspense>
  );
}
