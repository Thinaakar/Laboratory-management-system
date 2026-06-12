'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { permissionsByModule } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

interface PermissionGroupProps {
  module: string;
  permissions: { id: string; label: string }[];
  selected: string[];
  onChange: (keys: string[], checked: boolean) => void;
  readOnly?: boolean;
  defaultExpanded?: boolean;
}

export function PermissionGroup({
  module,
  permissions,
  selected,
  onChange,
  readOnly = false,
  defaultExpanded = false,
}: PermissionGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const moduleKeys = permissions.map((p) => p.id);
  const allSelected = moduleKeys.every((k) => selected.includes(k));
  const someSelected = moduleKeys.some((k) => selected.includes(k));

  return (
    <div className="overflow-hidden rounded-lg border border-muted-border bg-white">
      <div className="flex items-center gap-2 bg-muted-bg/80 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-white hover:text-slate-900"
          aria-expanded={expanded}
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <label className="flex flex-1 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={() => !readOnly && onChange(moduleKeys, !allSelected)}
            disabled={readOnly}
            className="h-4 w-4 rounded border-muted-border text-primary focus:ring-primary/30"
          />
          <span className="text-sm font-semibold text-slate-900">{module}</span>
        </label>
        <span className="text-[11px] font-medium text-muted">
          {moduleKeys.filter((k) => selected.includes(k)).length}/{moduleKeys.length}
        </span>
      </div>
      {expanded && (
        <div className="space-y-1 border-t border-muted-border px-4 py-3 pl-12">
          {permissions.map((perm) => (
            <label
              key={perm.id}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-muted-bg',
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(perm.id)}
                onChange={() => !readOnly && onChange([perm.id], !selected.includes(perm.id))}
                disabled={readOnly}
                className="h-4 w-4 rounded border-muted-border text-primary focus:ring-primary/30"
              />
              <span className="text-slate-600">{perm.label}</span>
              <span className="ml-auto font-mono text-[10px] text-muted">{perm.id}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface PermissionsMatrixProps {
  selected: string[];
  onChange: (permissions: string[]) => void;
  readOnly?: boolean;
}

export function PermissionsMatrix({ selected, onChange, readOnly = false }: PermissionsMatrixProps) {
  const grouped = permissionsByModule();
  const modules = Object.keys(grouped);

  const handleGroupChange = (keys: string[], checked: boolean) => {
    if (readOnly) return;
    const next = new Set(selected);
    keys.forEach((k) => (checked ? next.add(k) : next.delete(k)));
    onChange(Array.from(next));
  };

  return (
    <div className="max-h-[min(520px,60vh)] space-y-3 overflow-y-auto pr-1">
      {modules.map((module, i) => (
        <PermissionGroup
          key={module}
          module={module}
          permissions={grouped[module].map((p) => ({ id: p.id, label: p.label }))}
          selected={selected}
          onChange={handleGroupChange}
          readOnly={readOnly}
          defaultExpanded={i < 3}
        />
      ))}
    </div>
  );
}
