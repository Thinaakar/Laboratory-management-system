'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModuleHubAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  onSelect: () => void;
}

interface ModuleActionHubProps {
  actions: ModuleHubAction[];
  className?: string;
}

export function ModuleActionHub({ actions, className }: ModuleActionHubProps) {
  return (
    <div
      className={cn(
        'flex min-h-[min(420px,calc(100vh-12rem))] items-center justify-center py-8',
        className,
      )}
    >
      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onSelect}
            className="group flex flex-col rounded-xl border border-slate-200/80 bg-white p-6 text-left shadow-[0_1px_2px_0_rgba(15,23,42,0.04)] transition-all duration-150 hover:border-primary/30 hover:shadow-[0_4px_16px_0_rgba(83,189,235,0.12)] focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <action.icon size={22} strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{action.label}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
              {action.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Continue
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
