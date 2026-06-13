"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth/demo-users";
import { LimsSidebar } from "./sidebar";

export function LimsAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);

  return (
    <div className="lims-app flex h-screen overflow-hidden bg-[#f4f6f9]">
      <LimsSidebar />
      <main className="min-h-0 flex-1 overflow-y-auto no-scrollbar" suppressHydrationWarning>
        <div
          className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-5 lg:py-5"
          suppressHydrationWarning
        >
          {children}
        </div>
      </main>
    </div>
  );
}
