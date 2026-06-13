'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';

interface TableRowActionsProps {
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: TableRowActionsProps) {
  const btnClass =
    'rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary';

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onView}
        className={btnClass}
        aria-label={viewLabel}
        title={viewLabel}
      >
        <Eye className="h-4 w-4" />
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className={btnClass}
          aria-label={editLabel}
          title={editLabel}
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label={deleteLabel}
          title={deleteLabel}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
