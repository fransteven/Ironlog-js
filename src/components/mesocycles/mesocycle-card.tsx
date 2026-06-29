"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/shared/phase-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Calendar, Trash2, Edit2, Play, CheckCircle } from "lucide-react";
import { useTransition } from "react";
import { toggleMesocycleActive } from "@/actions/mesocycles";
import { toast } from "sonner";

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

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await toggleMesocycleActive(mesocycle.id, !mesocycle.isActive);
        toast.success(mesocycle.isActive ? "Mesociclo desactivado" : "Mesociclo activado");
      } catch (error) {
        console.error(error);
        toast.error("Error al cambiar estado activo");
      }
    });
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${mesocycle.isActive ? 'border-2 border-primary ring-2 ring-primary/10 bg-primary/5' : 'bg-card'}`}>
      {mesocycle.isActive && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl">
          ACTIVO
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold line-clamp-1">{mesocycle.name}</CardTitle>
            <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Iniciado: {mesocycle.startDate ? mesocycle.startDate : "Sin iniciar"}</span>
            </CardDescription>
          </div>
          <PhaseBadge phase={mesocycle.phase} />
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-4">
        {mesocycle.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {mesocycle.description}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 text-center bg-muted/40 p-2.5 rounded border text-xs">
          <div>
            <span className="block font-bold text-sm">{mesocycle.totalWeeks}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Semanas</span>
          </div>
          <div>
            <span className="block font-bold text-sm">S{mesocycle.deloadWeek}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Descarga</span>
          </div>
          <div>
            <span className="block font-bold text-sm">{mesocycle.strengthPct}%</span>
            <span className="text-[10px] text-muted-foreground uppercase">Intensidad</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border pt-4 mt-2">
        <div className="flex items-center gap-1">
          <Button
            variant={mesocycle.isActive ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleActive}
            disabled={isPending}
            className="text-xs h-8"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            <span>{mesocycle.isActive ? "Desactivar" : "Activar"}</span>
          </Button>

          <Button variant="outline" size="sm" render={<Link href={`/mesociclos/${mesocycle.id}`} />} className="h-8 text-xs">
            Ver Días ({mesocycle.trainingDaysCount || 0})
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" render={<Link href={`/mesociclos/${mesocycle.id}/editar`} />} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Edit2 className="h-4 w-4" />
          </Button>

          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title={`¿Eliminar mesociclo?`}
            description={`Esta acción eliminará de forma permanente el mesociclo "${mesocycle.name}" y todos sus días de entrenamiento y programaciones. No se puede deshacer.`}
            confirmText="Eliminar"
            onConfirm={onDelete}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
