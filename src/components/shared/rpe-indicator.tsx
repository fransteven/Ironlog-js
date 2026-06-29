import { rpeColor } from "@/lib/constants";

interface RpeIndicatorProps {
  rpe: number | string | null | undefined;
}

export function RpeIndicator({ rpe }: RpeIndicatorProps) {
  if (rpe === null || rpe === undefined) return <span className="text-muted-foreground">-</span>;
  const numRpe = Number(rpe);
  if (isNaN(numRpe)) return <span className="text-muted-foreground">-</span>;

  const color = rpeColor(numRpe);

  return (
    <span 
      style={{ color }} 
      className="font-bold inline-flex items-center gap-1 text-sm bg-muted/30 px-1.5 py-0.5 rounded"
    >
      <span 
        style={{ backgroundColor: color }} 
        className="h-2 w-2 rounded-full inline-block shrink-0"
      />
      <span>@ {numRpe}</span>
    </span>
  );
}
