import { Badge } from "@/components/ui/badge";
import { PURPOSE_LABELS } from "@/lib/constants";

interface PurposeBadgeProps {
  purpose: keyof typeof PURPOSE_LABELS;
}

export function PurposeBadge({ purpose }: PurposeBadgeProps) {
  const label = PURPOSE_LABELS[purpose] || purpose;

  // Asignar variantes de color según el propósito
  let badgeStyle = "bg-slate-100 text-slate-800 hover:bg-slate-100/80";
  if (purpose === "STRENGTH") {
    badgeStyle = "bg-red-50 text-red-700 border border-red-200 hover:bg-red-50/80";
  } else if (purpose === "HYPERTROPHY") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50/80";
  } else if (purpose === "POWER") {
    badgeStyle = "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50/80";
  } else if (purpose === "STABILIZER") {
    badgeStyle = "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50/80";
  }

  return (
    <Badge variant="outline" className={`font-semibold rounded px-2 py-0.5 ${badgeStyle}`}>
      {label}
    </Badge>
  );
}
