import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-card/50 my-4 min-h-[300px]">
      <div className="p-3 bg-muted rounded-full text-muted-foreground mb-4">
        <Icon className="h-10 w-10 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {children && (
        <div className="flex items-center justify-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
