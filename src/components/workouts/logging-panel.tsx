"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SetLogger } from "@/components/workouts/set-logger";
import { SetTable } from "@/components/workouts/set-table";
import { addSet } from "@/actions/workouts";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface LoggingPanelProps {
  sessionId: number;
  sessionDate: string;
  sessionTitle: string;
  exercises: { id: number; name: string; primaryMuscle: string }[];
  lastSetsData: Record<number, { weightKg: number; repsCompleted: number; rpe: number | null }>;
  exerciseLogsList: React.ComponentProps<typeof SetTable>["exerciseLogsList"];
  prescribedMap: Record<number, { sets: number; repsMin: number; repsMax: number; rpeTarget: string }>;
  finalizarHref: string;
}

export function LoggingPanel({
  sessionId,
  sessionDate,
  sessionTitle,
  exercises,
  lastSetsData,
  exerciseLogsList,
  prescribedMap,
  finalizarHref,
}: LoggingPanelProps) {
  const router = useRouter();
  const [isSavingSet, setIsSavingSet] = useState(false);

  const handlePendingChange = useCallback((pending: boolean) => {
    setIsSavingSet(pending);
  }, []);

  function handleFinalizarClick() {
    if (isSavingSet) {
      toast.info("Espera a que se guarde la última serie antes de finalizar.");
      return;
    }
    router.push(finalizarHref);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
            Registro Activo · {sessionDate}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {sessionTitle || "Sesión de Entrenamiento"}
          </h1>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={handleFinalizarClick}
          disabled={isSavingSet}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
        >
          {isSavingSet ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{isSavingSet ? "Guardando serie..." : "Finalizar Sesión"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logger panel (izquierda/arriba en móvil) */}
        <div className="lg:col-span-1 space-y-4">
          <SetLogger
            sessionId={sessionId}
            exercises={exercises}
            lastSetsData={lastSetsData}
            action={addSet}
            onPendingChange={handlePendingChange}
          />
        </div>

        {/* Set Table (derecha/abajo en móvil) */}
        <div className="lg:col-span-2 space-y-4">
          <SetTable
            sessionId={sessionId}
            exerciseLogsList={exerciseLogsList}
            prescribedMap={prescribedMap}
          />
        </div>
      </div>
    </div>
  );
}
