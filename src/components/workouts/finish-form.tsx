"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { finishSessionSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

type FormValues = z.input<typeof finishSessionSchema>;

interface FinishFormProps {
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function FinishForm({ defaultValues, action }: FinishFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(finishSessionSchema),
    defaultValues: {
      durationMinutes: 60,
      perceivedEnergy: 7,
      notes: "",
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
        toast.error("Corrige los errores en el formulario.");
      } else {
        toast.success("Entrenamiento finalizado con éxito. ¡Buen trabajo!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al finalizar el entrenamiento.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl bg-card border rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3 mb-3 text-emerald-600">
          <CheckCircle className="h-5 w-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Finalizar Entrenamiento</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (minutos)</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perceivedEnergy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nivel de Energía (1-10)</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Energía" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} - {num <= 3 ? "Bajo" : num <= 7 ? "Normal" : "Excelente"}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comentarios o sensaciones de la sesión</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Me sentí con buena fuerza en banca, pero algo de molestia en hombro..." className="resize-y" {...field} />
              </FormControl>
              <FormDescription>Describe cómo te sentiste, el rendimiento o cualquier factor externo relevante.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          {isPending ? "Guardando..." : "Guardar y Finalizar Sesión"}
        </Button>
      </form>
    </Form>
  );
}
