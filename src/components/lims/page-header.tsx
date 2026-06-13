interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="lims-page-header">
      <div className="min-w-0">
        <h1 className="lims-page-title">{title}</h1>
        {description && <p className="lims-page-desc">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
