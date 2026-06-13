import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('lims-form-field', className)}>
      <label htmlFor={htmlFor} className="lims-label">
        {label}
        {required && <span className="lims-required" aria-hidden="true">*</span>}
        {optional && <span className="lims-optional">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="lims-field-hint">{hint}</p>}
      {error && (
        <p className="lims-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 1 && 'grid-cols-1',
        cols === 2 && 'grid-cols-1 sm:grid-cols-2',
        cols === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {children}
    </div>
  );
}
