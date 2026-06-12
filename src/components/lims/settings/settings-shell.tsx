'use client';

import { PageHeader } from '@/components/lims/page-header';
import { SettingsTabs } from '@/components/lims/settings/settings-tabs';

interface SettingsShellProps {
  children: React.ReactNode;
  description?: string;
}

export function SettingsShell({
  children,
  description = 'Lab profile, master data, and system preferences',
}: SettingsShellProps) {
  return (
    <div>
      <PageHeader title="Settings" description={description} />
      <SettingsTabs />
      {children}
    </div>
  );
}
