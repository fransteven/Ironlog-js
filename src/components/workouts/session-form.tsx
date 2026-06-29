"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { workoutSessionSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState } from "react";

type FormValues = z.input<typeof workoutSessionSchema>;

interface SessionFormProps {
  trainingDaysList: { id: number; name: string; mesocycleName: string }[];
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function SessionForm({ trainingDaysList, defaultValues, action }: SessionFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(workoutSessionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      trainingDayId: null,
      title: "",
      isDeload: false,
      bodyweightKg: null,
      perceivedEnergy: null,
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
        toast.success("Sesión guardada");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la sesión de entrenamiento.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl bg-card border rounded-lg p-6 shadow-sm">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Sesión</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Sesión de empuje, Día libre de piernas..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bodyweightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Corporal (kg) - Opcional</FormLabel>
                <FormControl>
                  <Input type="number" step={0.1} placeholder="Ej. 78.5" {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="trainingDayId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vincular a un Día de tu Mesociclo (Opcional)</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val === "NONE" ? null : Number(val))}
                defaultValue={field.value ? String(field.value) : "NONE"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un día programado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NONE">Sesión Libre (Ningún día programado)</SelectItem>
                  {trainingDaysList.map((day) => (
                    <SelectItem key={day.id} value={String(day.id)}>
                      {day.mesocycleName} - {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Esto cargará automáticamente los ejercicios prescritos en este día.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDeload"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-4 bg-muted/20">
              <FormControl>
                <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Esta sesión es de Descarga (Deload)</FormLabel>
                <FormDescription>Marca esto si estás realizando una sesión con volumen e intensidad reducidos.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Iniciando..." : "Iniciar Sesión de Entrenamiento"}
        </Button>
      </form>
    </Form>
  );
}
