import { LimsAppShell } from '@/components/lims/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <LimsAppShell>{children}</LimsAppShell>;
}
