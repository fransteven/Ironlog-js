"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { prescribedExerciseSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PURPOSE_LABELS } from "@/lib/constants";
import { useState } from "react";

type FormValues = z.input<typeof prescribedExerciseSchema>;

interface PrescribedExerciseFormProps {
  exercises: {
    id: number;
    name: string;
    category: string;
    primaryMuscle: string;
  }[];
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function PrescribedExerciseForm({ exercises, defaultValues, action }: PrescribedExerciseFormProps) {
  const [isPending, setIsPending] = useState(false);

  // Ordenar ejercicios por nombre
  const sortedExercises = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  const form = useForm<FormValues>({
    resolver: zodResolver(prescribedExerciseSchema),
    defaultValues: {
      exerciseId: undefined,
      order: 1,
      sets: 3,
      repsMin: 6,
      repsMax: 8,
      intensityMin: null,
      intensityMax: null,
      rpeTarget: 8.0,
      restSeconds: 120,
      purpose: "STRENGTH",
      notes: "",
      deloadSets: null,
      deloadRpe: null,
      ...defaultValues,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        fd.append(k, String(v));
      }
    });

    try {
      const result = await action(fd);
      if (result?.errors) {
        Object.entries(result.errors).forEach(([field, msgs]) => {
          form.setError(field as keyof FormValues, { message: msgs[0] });
        });
        toast.error("Corrige los errores del formulario.");
      } else {
        toast.success("Ejercicio prescrito con éxito");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al prescribir el ejercicio.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card border rounded-lg p-6 shadow-sm">
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seleccionar Ejercicio</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(Number(val))}
                defaultValue={field.value ? String(field.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Busca o selecciona un ejercicio..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedExercises.map((ex) => (
                    <SelectItem key={ex.id} value={String(ex.id)}>
                      {ex.name} ({ex.primaryMuscle})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden en el día</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series Prescritas</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enfoque / Propósito</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Propósito" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PURPOSE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="repsMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps Mínimas</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repsMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps Máximas</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
          <FormField
            control={form.control}
            name="rpeTarget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RPE Objetivo</FormLabel>
                <FormControl>
                  <Input type="number" step={0.5} min={5} max={10} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormDescription>RPE objetivo (ej. 8.0)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="restSeconds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descanso (segundos)</FormLabel>
                <FormControl>
                  <Input type="number" step={10} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormDescription>Ej: 120s = 2 min</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intensityMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intensidad % 1RM (Opcional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej. 75" {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/30 border rounded-md p-4 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configuración para semana de descarga (Deload)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deloadSets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series en descarga</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="Ej. 2" {...field} value={(field.value as any) ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deloadRpe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RPE en descarga</FormLabel>
                  <FormControl>
                    <Input type="number" step={0.5} placeholder="Ej. 6" {...field} value={(field.value as any) ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas de Prescripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej. Usar agarre prono, mantener tempo controlado en excéntrica..." className="resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" loading={isPending}>
          Prescribir Ejercicio
        </Button>
      </form>
    </Form>
  );
}
