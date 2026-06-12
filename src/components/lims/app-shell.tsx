'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth/demo-users';
import { LimsSidebar } from './sidebar';

export function LimsAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted-bg">
      <LimsSidebar />
      <main className="min-h-0 flex-1 overflow-y-auto" suppressHydrationWarning>
        <div className="mx-auto max-w-7xl p-6" suppressHydrationWarning>{children}</div>
      </main>
    </div>
  );
}
