'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function BranchesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/branches');
  }, [router]);

  return null;
}

export default function BranchesPage() {
  return (
    <Suspense fallback={null}>
      <BranchesRedirect />
    </Suspense>
  );
}
