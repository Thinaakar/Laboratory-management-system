'use client';

import { useHydrated } from '@/hooks/use-hydrated';

interface ClientOnlyProps {
  children: React.ReactNode;
  /** Placeholder shown during SSR and the first client paint */
  fallback?: React.ReactNode;
}

/**
 * Renders children only after mount so browser extensions cannot
 * inject attributes (e.g. fdprocessedid) before React hydrates.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hydrated = useHydrated();
  if (!hydrated) return fallback;
  return children;
}

interface HydrationSafeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  skeletonClassName?: string;
}

export function HydrationSafeInput({
  skeletonClassName,
  className,
  ...props
}: HydrationSafeInputProps) {
  return (
    <ClientOnly
      fallback={
        <div
          className={skeletonClassName ?? className}
          aria-hidden="true"
        />
      }
    >
      <input className={className} suppressHydrationWarning {...props} />
    </ClientOnly>
  );
}

interface HydrationSafeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  skeletonClassName?: string;
  children: React.ReactNode;
}

export function HydrationSafeSelect({
  skeletonClassName,
  className,
  children,
  ...props
}: HydrationSafeSelectProps) {
  return (
    <ClientOnly
      fallback={
        <div
          className={skeletonClassName ?? className}
          aria-hidden="true"
        />
      }
    >
      <select className={className} suppressHydrationWarning {...props}>
        {children}
      </select>
    </ClientOnly>
  );
}

interface HydrationSafeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  skeletonClassName?: string;
}

export function HydrationSafeButton({
  skeletonClassName,
  className,
  children,
  ...props
}: HydrationSafeButtonProps) {
  return (
    <ClientOnly
      fallback={
        <div
          className={skeletonClassName ?? className}
          aria-hidden="true"
        />
      }
    >
      <button type="button" className={className} suppressHydrationWarning {...props}>
        {children}
      </button>
    </ClientOnly>
  );
}
