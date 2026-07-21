"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mesocycleSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PHASE_LABELS } from "@/lib/constants";
import { useState } from "react";

type FormValues = z.input<typeof mesocycleSchema>;

interface MesocycleFormProps {
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function MesocycleForm({ defaultValues, action }: MesocycleFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(mesocycleSchema),
    defaultValues: {
      name: "",
      phase: "ACCUMULATION",
      totalWeeks: 4,
      deloadWeek: 4,
      startDate: new Date().toISOString().split("T")[0],
      description: "",
      strengthPct: 65,
      isActive: true,
      order: 1,
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
        toast.error("Corrige los errores en el formulario.");
      } else {
        toast.success("Mesociclo guardado correctamente");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Ocurrió un error al guardar el mesociclo.");
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
              <FormLabel>Nombre del Mesociclo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Hipertrofia General Bloque 1, Fuerza Base..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fase de Periodización</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una fase" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(PHASE_LABELS).map(([k, v]) => (
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
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio (Opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="totalWeeks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semanas Totales</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={12} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deloadWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semana de Deload</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
                <FormDescription>Semana destinada a la descarga voluntaria.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strengthPct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>% Intensidad Promedio</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={100} {...field} value={(field.value as any) ?? ""} />
                </FormControl>
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
              <FormLabel>Objetivo o Notas del Mesociclo</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej. Enfocado en volumen de empujes, transición de fuerza..." className="resize-y" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-4 bg-muted/20">
              <FormControl>
                <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Marcar como Mesociclo Activo</FormLabel>
                <FormDescription>Solo un mesociclo puede estar activo al mismo tiempo. Al activar este, los otros se desactivarán.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" loading={isPending}>
            Guardar Mesociclo
          </Button>
        </div>
      </form>
    </Form>
  );
}
