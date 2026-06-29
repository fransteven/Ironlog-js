"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/shared/phase-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Trash2, Edit2, ChevronRight, CheckCircle } from "lucide-react";
import { useTransition } from "react";
import { toggleMesocycleActive } from "@/actions/mesocycles";
import { toast } from "sonner";
import { PHASE_COLORS } from "@/lib/constants";

interface MesocycleCardProps {
  mesocycle: {
    id: number;
    name: string;
    phase: any;
    totalWeeks: number;
    deloadWeek: number;
    startDate: string | null;
    description: string | null;
    strengthPct: number;
    isActive: boolean | null;
    createdAt: Date | null;
    trainingDaysCount?: number;
  };
  onDelete: () => Promise<any>;
}

export function MesocycleCard({ mesocycle, onDelete }: MesocycleCardProps) {
  const [isPending, startTransition] = useTransition();
  const phaseColor = PHASE_COLORS[mesocycle.phase as keyof typeof PHASE_COLORS] || "#6B7280";

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleMesocycleActive(mesocycle.id, !mesocycle.isActive);
        toast.success(mesocycle.isActive ? "Mesociclo desactivado" : "Mesociclo activado");
      } catch {
        toast.error("Error al cambiar estado activo");
      }
    });
  }

  return (
    <div
      className="relative rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
      style={{
        background: mesocycle.isActive
          ? `linear-gradient(145deg, ${phaseColor}0d, ${phaseColor}05)`
          : undefined,
        borderColor: mesocycle.isActive ? `${phaseColor}20` : undefined,
      }}
    >
      {mesocycle.isActive && (
        <div
          className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
          style={{ background: `${phaseColor}30`, color: phaseColor }}
        >
          Activo
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3 pr-12">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${phaseColor}15` }}
          >
            <div className="w-3 h-3 rounded-sm" style={{ background: phaseColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold text-foreground truncate">{mesocycle.name}</h3>
            <div className="mt-1">
              <PhaseBadge phase={mesocycle.phase} />
            </div>
          </div>
        </div>

        {/* Description */}
        {mesocycle.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{mesocycle.description}</p>
        )}

        {/* Progress bar (only active) */}
        {mesocycle.isActive && (
          <div className="space-y-1">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${phaseColor}, ${phaseColor}bb)`,
                  width: "60%",
                }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4">
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Semanas</p>
            <p className="text-sm font-bold text-foreground">{mesocycle.totalWeeks}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Descarga</p>
            <p className="text-sm font-bold text-foreground">S{mesocycle.deloadWeek}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Intensidad</p>
            <p className="text-sm font-bold text-foreground">{mesocycle.strengthPct}%</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleActive}
            disabled={isPending}
            className="h-7 text-xs px-2.5"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            {mesocycle.isActive ? "Desactivar" : "Activar"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/mesociclos/${mesocycle.id}`} />}
            className="h-7 text-xs px-2.5 text-primary"
          >
            {mesocycle.trainingDaysCount || 0} días
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            render={<Link href={`/mesociclos/${mesocycle.id}/editar`} />}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            }
            title="¿Eliminar mesociclo?"
            description={`Eliminará permanentemente "${mesocycle.name}" y todos sus días. No se puede deshacer.`}
            confirmText="Eliminar"
            onConfirm={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
