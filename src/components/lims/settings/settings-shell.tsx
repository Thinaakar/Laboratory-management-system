'use client';

import { PageHeader } from '@/components/lims/page-header';
import { SettingsTabs } from '@/components/lims/settings/settings-tabs';

interface SettingsShellProps {
  children: React.ReactNode;
  description?: string;
}

export function SettingsShell({
  children,
  description = 'General settings, master data, and stocks',
}: SettingsShellProps) {
  return (
    <div>
      <PageHeader title="Settings" description={description} />
      <SettingsTabs />
      {children}
    </div>
  );
}
