'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/general');
  }, [router]);

  return null;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsRedirect />
    </Suspense>
  );
}
