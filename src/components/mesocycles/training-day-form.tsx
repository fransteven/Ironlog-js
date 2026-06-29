"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trainingDaySchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";

type FormValues = z.input<typeof trainingDaySchema>;

interface TrainingDayFormProps {
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function TrainingDayForm({ defaultValues, action }: TrainingDayFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingDaySchema),
    defaultValues: {
      name: "",
      dayNumber: 1,
      focus: "",
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
        toast.success("Día guardado correctamente");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el día de entrenamiento.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl bg-card border rounded-lg p-6 shadow-sm">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Día</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Empuje A, Torso Fuerza, Día de Pierna..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dayNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número del Día</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormDescription>Ej. Día 1, Día 2 de la semana.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="focus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enfoque (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Pectoral, Cadena posterior, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-4">
          {isPending ? "Guardando..." : "Guardar Día"}
        </Button>
      </form>
    </Form>
  );
}
