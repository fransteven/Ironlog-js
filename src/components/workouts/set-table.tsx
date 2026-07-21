"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RpeIndicator } from "@/components/shared/rpe-indicator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Trash2, AlertCircle, Dumbbell } from "lucide-react";
import { deleteSet } from "@/actions/workouts";
import { toast } from "sonner";
import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";

interface SetTableProps {
  sessionId: number;
  exerciseLogsList: {
    id: number;
    exercise: {
      id: number;
      name: string;
      primaryMuscle: string;
      category: string;
    };
    notes: string | null;
    sets: {
      id: number;
      setNumber: number;
      weightKg: string;
      repsCompleted: number;
      rpe: string | null;
      isWarmup: boolean | null;
      notes: string | null;
    }[];
  }[];
  prescribedMap?: Record<number, { sets: number; repsMin: number; repsMax: number; rpeTarget: string }>;
}

export function SetTable({ sessionId, exerciseLogsList, prescribedMap = {} }: SetTableProps) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete(setId: number) {
    try {
      const res = await deleteSet(setId, sessionId);
      if (res?.error) {
        toast.error(res.error);
        return { error: res.error };
      } else {
        toast.success("Serie eliminada");
        return { success: true };
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al eliminar la serie.");
      return { error: "Error" };
    }
  }

  if (exerciseLogsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-card text-center text-muted-foreground my-4">
        <Dumbbell className="h-8 w-8 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">Aún no has registrado ningún ejercicio en esta sesión.</p>
        <p className="text-xs">Usa el panel lateral para registrar tu primera serie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exerciseLogsList.map((log) => {
        const pres = prescribedMap[log.exercise.id];
        const workingSets = log.sets.filter((s) => !s.isWarmup).length;

        return (
          <div key={log.id} className="bg-card border rounded-lg overflow-hidden shadow-sm">
            {/* Header del Ejercicio en el Log */}
            <div className="bg-muted/40 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b">
              <div>
                <h4 className="font-bold text-base text-foreground">{log.exercise.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0.5">
                    {log.exercise.primaryMuscle}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {log.exercise.category}
                  </span>
                </div>
              </div>

              {/* Objetivos Prescritos */}
              {pres && (
                <div className="text-xs bg-primary/10 border border-primary/30 text-foreground px-3 py-1.5 rounded">
                  <span className="text-muted-foreground font-semibold">Objetivo:</span> <strong className="font-bold text-primary">{pres.sets} series</strong> × <strong className="font-bold text-primary">{pres.repsMin}-{pres.repsMax} reps</strong> @ <strong className="font-bold text-primary">{pres.rpeTarget} RPE</strong>
                  {workingSets > 0 && (
                    <span className="ml-2 pl-2 border-l border-primary/30">
                      Progreso: <strong className="font-bold text-primary">{workingSets}/{pres.sets}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tabla de Series */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Serie</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Repeticiones</TableHead>
                  <TableHead>RPE / Esfuerzo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[60px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.sets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground text-xs py-4">
                      No hay series registradas para este ejercicio.
                    </TableCell>
                  </TableRow>
                ) : (
                  log.sets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell className="font-semibold text-sm">
                        #{set.setNumber}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {set.weightKg} kg
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {set.repsCompleted}
                      </TableCell>
                      <TableCell>
                        <RpeIndicator rpe={set.rpe} />
                      </TableCell>
                      <TableCell>
                        {set.isWarmup ? (
                          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-medium">
                            Calentamiento
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary font-medium border-primary/20">
                            Efectiva
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                          title="¿Eliminar serie?"
                          description={`¿Estás seguro de que quieres eliminar la serie #${set.setNumber} de ${log.exercise.name}?`}
                          confirmText="Eliminar"
                          onConfirm={() => handleDelete(set.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
