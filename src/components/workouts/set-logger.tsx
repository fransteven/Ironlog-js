"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setLogSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ExerciseCombobox } from "@/components/shared/exercise-combobox";
import { toast } from "sonner";
import { estimateE1RM } from "@/lib/calculations";
import { Dumbbell, Award, Plus, RefreshCw } from "lucide-react";

type FormValues = z.input<typeof setLogSchema>;

interface SetLoggerProps {
  sessionId: number;
  exercises: { id: number; name: string; primaryMuscle: string }[];
  lastSetsData?: Record<number, { weightKg: number; repsCompleted: number; rpe: number | null }>;
  action: (sessionId: number, formData: FormData) => Promise<{ success?: boolean; isPR?: boolean; errors?: Record<string, string[]> }>;
  onSetAdded?: () => void;
  onPendingChange?: (pending: boolean) => void;
}

export function SetLogger({ sessionId, exercises, lastSetsData = {}, action, onSetAdded, onPendingChange }: SetLoggerProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedExId, setSelectedExId] = useState<number | null>(null);

  // Notificar al padre cuando hay un addSet en vuelo, para poder bloquear
  // navegaciones (p.ej. "Finalizar Sesión") que abortarían este fetch y
  // perderían la serie.
  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  // Ordenar ejercicios
  const sortedExercises = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  const form = useForm<FormValues>({
    resolver: zodResolver(setLogSchema),
    defaultValues: {
      exerciseId: undefined,
      weightKg: 0,
      repsCompleted: 0,
      rpe: null,
      isWarmup: false,
      notes: "",
    },
  });

  const watchExerciseId = useWatch({ control: form.control, name: "exerciseId" });
  const watchWeight = useWatch({ control: form.control, name: "weightKg" });
  const watchReps = useWatch({ control: form.control, name: "repsCompleted" });
  const watchRpe = useWatch({ control: form.control, name: "rpe" });
  const watchIsWarmup = useWatch({ control: form.control, name: "isWarmup" });

  // Sincronizar el id de ejercicio seleccionado localmente
  useEffect(() => {
    if (watchExerciseId) {
      setSelectedExId(Number(watchExerciseId));
    } else {
      setSelectedExId(null);
    }
  }, [watchExerciseId]);

  // Autofill del último set de ese ejercicio
  const lastSet = selectedExId ? lastSetsData[selectedExId] : null;

  function autofillLastSet() {
    if (lastSet) {
      form.setValue("weightKg", lastSet.weightKg);
      form.setValue("repsCompleted", lastSet.repsCompleted);
      form.setValue("rpe", lastSet.rpe);
      toast.info("Autocompletado con la última serie realizada");
    }
  }

  // Calcular e1RM estimado en tiempo real
  const currentE1RM = estimateE1RM(
    Number(watchWeight || 0),
    Number(watchReps || 0),
    watchRpe ? Number(watchRpe) : undefined
  );

  async function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });

    startTransition(async () => {
      try {
        const result = await action(sessionId, fd);
        if (result?.errors) {
          Object.entries(result.errors).forEach(([field, msgs]) => {
            form.setError(field as keyof FormValues, { message: msgs[0] });
          });
          toast.error("Error al registrar la serie.");
        } else {
          if (result?.isPR) {
            toast("🏆 ¡NUEVO RÉCORD PERSONAL! 🏆", {
              description: `Has superado tu e1RM estimado para este ejercicio con ${watchWeight}kg × ${watchReps} reps!`,
              duration: 5000,
            });
          } else {
            toast.success("Serie registrada");
          }
          // Limpiar o resetear el formulario (pero mantener el ejercicio seleccionado)
          form.reset({
            exerciseId: data.exerciseId,
            weightKg: data.weightKg, // Mantener peso/reps como sugerencia para la siguiente serie
            repsCompleted: data.repsCompleted,
            rpe: data.rpe,
            isWarmup: false,
            notes: "",
          });
          if (onSetAdded) onSetAdded();
        }
      } catch (err) {
        console.error(err);
        toast.error("Ocurrió un error inesperado.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 bg-card border rounded-lg p-5 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3 mb-3">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Registrar Serie de Entrenamiento</h3>
        </div>

        {/* Selector de ejercicio */}
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <ExerciseCombobox
                exercises={sortedExercises}
                value={field.value ? Number(field.value) : null}
                onChange={(id) => field.onChange(id)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de autofill de última serie */}
        {lastSet && (
          <div className="flex items-center justify-between bg-muted/50 border rounded px-3 py-1.5 text-xs text-muted-foreground animate-in fade-in duration-200">
            <span>
              Última serie: <strong>{lastSet.weightKg} kg</strong> × <strong>{lastSet.repsCompleted} reps</strong> {lastSet.rpe ? `@ ${lastSet.rpe}` : ""}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autofillLastSet}
              className="h-6 text-[10px] py-0 px-2 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="h-3 w-3" />
              Copiar
            </Button>
          </div>
        )}

        {/* Campos peso, reps y RPE en grid */}
        <div className="grid grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Peso (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step={0.5} min={0} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repsCompleted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Reps</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rpe"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">RPE</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={0.5}
                    placeholder="Op."
                    min={5}
                    max={10}
                    {...field}
                    value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkbox de Warmup y e1RM real-time */}
        <div className="flex items-center justify-between border-t border-b py-3 my-2 text-xs">
          <FormField
            control={form.control}
            name="isWarmup"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">Calentamiento</FormLabel>
              </FormItem>
            )}
          />

          {!watchIsWarmup && currentE1RM && currentE1RM > 0 ? (
            <div className="flex items-center gap-1.5 text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded font-bold animate-in zoom-in duration-300">
              <Award className="h-4 w-4" />
              <span>e1RM: {currentE1RM} kg</span>
            </div>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>

        {/* Botón enviar */}
        <Button type="submit" loading={isPending} disabled={!watchExerciseId} className="w-full font-bold">
          Registrar Serie
          <Plus className="h-4 w-4 ml-1.5" />
        </Button>
      </form>
    </Form>
  );
}
