import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm max-w-2xl">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 self-start md:self-center">
          {children}
        </div>
      )}
    </div>
  );
}
