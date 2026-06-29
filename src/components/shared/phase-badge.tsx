import { Badge } from "@/components/ui/badge";
import { PHASE_COLORS, PHASE_LABELS } from "@/lib/constants";

interface PhaseBadgeProps {
  phase: keyof typeof PHASE_LABELS;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const color = PHASE_COLORS[phase] || "#6B7280";
  const label = PHASE_LABELS[phase] || phase;

  return (
    <Badge 
      style={{ backgroundColor: color, color: "#fff" }}
      className="border-none font-semibold shadow-sm px-2 py-0.5"
    >
      {label}
    </Badge>
  );
}
