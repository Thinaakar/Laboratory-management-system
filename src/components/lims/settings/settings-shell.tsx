'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/lims/page-header';
import { SettingsTabs } from '@/components/lims/settings/settings-tabs';
import { usePermissions } from '@/hooks/use-permissions';
import {
  canAccessSettingsPath,
  getDefaultSettingsPath,
} from '@/lib/navigation/settings-nav';

interface SettingsShellProps {
  children: React.ReactNode;
  description?: string;
}

export function SettingsShell({
  children,
  description = 'General settings, master data, and stocks',
}: SettingsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { can } = usePermissions();

  useEffect(() => {
    if (!canAccessSettingsPath(pathname, can)) {
      router.replace(getDefaultSettingsPath(can));
    }
  }, [pathname, router, can]);

  if (!canAccessSettingsPath(pathname, can)) {
    return null;
  }

  return (
    <div>
      <PageHeader title="Settings" description={description} />
      <SettingsTabs />
      {children}
    </div>
  );
}
