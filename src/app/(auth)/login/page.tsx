'use client';

import { LoginFormCard } from '@/components/auth/login-form-card';
import { LoginHeroPanel } from '@/components/auth/login-hero-panel';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted-bg lg:flex-row">
      <div className="order-1 flex w-full items-center justify-center bg-white px-4 py-10 sm:px-8 lg:order-2 lg:w-[40%] lg:shrink-0 lg:px-10 lg:py-12">
        <LoginFormCard />
      </div>
      <div className="order-2 w-full lg:order-1 lg:w-[60%] lg:shrink-0">
        <LoginHeroPanel />
      </div>
    </div>
  );
}
