'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { getDefaultSettingsPath } from '@/lib/navigation/settings-nav';

function SettingsRedirect() {
  const router = useRouter();
  const { can } = usePermissions();

  useEffect(() => {
    router.replace(getDefaultSettingsPath(can));
  }, [router, can]);

  return null;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsRedirect />
    </Suspense>
  );
}
