'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function NewSampleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/samples?register=1');
  }, [router]);

  return null;
}

export default function NewSamplePage() {
  return (
    <Suspense fallback={null}>
      <NewSampleRedirect />
    </Suspense>
  );
}
