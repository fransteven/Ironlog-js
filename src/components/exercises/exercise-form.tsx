"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { exerciseSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CATEGORY_LABELS, MUSCLE_LABELS, EQUIPMENT_LABELS, PATTERN_LABELS } from "@/lib/constants";
import { useState } from "react";

type FormValues = z.input<typeof exerciseSchema>;

interface ExerciseFormProps {
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function ExerciseForm({ defaultValues, action }: ExerciseFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      category: "PRIMARY",
      primaryMuscle: "QUADS",
      secondaryMuscles: "",
      equipment: "BARBELL",
      movementPattern: "SQUAT",
      description: "",
      isUnilateral: false,
      isIsometric: false,
      ...defaultValues,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsPending(true);
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      fd.append(k, String(v ?? ""));
    });

    try {
      const result = await action(fd);
      if (result?.errors) {
        Object.entries(result.errors).forEach(([field, msgs]) => {
          form.setError(field as keyof FormValues, { message: msgs[0] });
        });
        toast.error("Corrige los errores del formulario.");
      } else {
        toast.success("Ejercicio guardado correctamente");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Ocurrió un error al guardar el ejercicio.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-card border rounded-lg p-6 shadow-sm">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Ejercicio</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Sentadilla trasera, Press de banca..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
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

          <FormField
            control={form.control}
            name="primaryMuscle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo Muscular Primario</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona grupo muscular" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(MUSCLE_LABELS).map(([k, v]) => (
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

        <FormField
          control={form.control}
          name="secondaryMuscles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Músculos Secundarios (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Hombros, Tríceps (separados por coma)" {...field} />
              </FormControl>
              <FormDescription>Músculos que actúan como sinergistas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamiento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona equipamiento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(EQUIPMENT_LABELS).map(([k, v]) => (
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

          <FormField
            control={form.control}
            name="movementPattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patrón de Movimiento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona patrón" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PATTERN_LABELS).map(([k, v]) => (
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción o Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Instrucciones técnicas, rango de movimiento, etc." className="resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row items-start space-x-6 border rounded-md p-4 bg-muted/20">
          <FormField
            control={form.control}
            name="isUnilateral"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Unilateral</FormLabel>
                  <FormDescription>Se trabaja un lado a la vez</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isIsometric"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Isométrico</FormLabel>
                  <FormDescription>Sin movimiento (ej. plancha)</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Ejercicio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
