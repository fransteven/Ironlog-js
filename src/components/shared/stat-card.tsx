import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  valueSuffix?: string;
  icon?: LucideIcon;
  description?: string;
  className?: string;
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorMap = {
  blue:   { bg: "bg-blue-500/7 border-blue-500/12",   text: "text-blue-400",   iconBg: "bg-blue-500/10" },
  green:  { bg: "bg-emerald-500/7 border-emerald-500/12", text: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  amber:  { bg: "bg-amber-500/7 border-amber-500/12", text: "text-amber-400",   iconBg: "bg-amber-500/10" },
  red:    { bg: "bg-red-500/7 border-red-500/12",     text: "text-red-400",     iconBg: "bg-red-500/10" },
  purple: { bg: "bg-violet-500/7 border-violet-500/12", text: "text-violet-400", iconBg: "bg-violet-500/10" },
};

export function StatCard({ title, value, valueSuffix, icon: Icon, description, className, color = "blue" }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("rounded-2xl border p-4", c.bg, className)}>
      {Icon && (
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-3", c.iconBg)}>
          <Icon className={cn("h-4 w-4", c.text)} />
        </div>
      )}
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
      <div className={cn("text-2xl font-bold leading-none", c.text)}>
        {value}
        {valueSuffix && (
          <span className="text-sm font-normal text-muted-foreground ml-1">{valueSuffix}</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{description}</p>
      )}
    </div>
  );
}
