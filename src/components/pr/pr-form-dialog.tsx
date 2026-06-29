"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { personalRecordSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Award } from "lucide-react";
import { createPersonalRecord } from "@/actions/records";

type FormValues = z.input<typeof personalRecordSchema>;

interface PRFormDialogProps {
  exercises: { id: number; name: string; primaryMuscle: string }[];
}

export function PRFormDialog({ exercises }: PRFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sortedExercises = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  const form = useForm<FormValues>({
    resolver: zodResolver(personalRecordSchema),
    defaultValues: {
      exerciseId: undefined,
      recordType: "1RM",
      weightKg: 0,
      reps: 1,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  async function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      fd.append(k, String(v ?? ""));
    });

    startTransition(async () => {
      try {
        const result = await createPersonalRecord(fd);
        if (result?.errors) {
          Object.entries(result.errors).forEach(([field, msgs]) => {
            form.setError(field as keyof FormValues, { message: msgs[0] });
          });
          toast.error("Corrige los errores del formulario.");
        } else {
          toast.success("Récord personal registrado con éxito");
          form.reset();
          setOpen(false);
        }
      } catch (err) {
        console.error(err);
        toast.error("Ocurrió un error inesperado al guardar el récord.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="flex items-center gap-1.5 font-bold shadow-sm" />}>
        <Plus className="h-4 w-4" />
        <span>Registrar Récord (PR)</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Award className="h-5 w-5 text-amber-500 fill-amber-100" />
            Registrar Récord Personal Manual
          </DialogTitle>
          <DialogDescription>
            Registra una marca personal lograda fuera de las rutinas ordinarias.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="exerciseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ejercicio</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecciona un ejercicio..." />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Récord</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1RM">1RM Real</SelectItem>
                        <SelectItem value="E1RM">e1RM (Estimado)</SelectItem>
                        <SelectItem value="REP_PR">Récord de Reps</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step={0.5} min={0.5} {...field} value={(field.value as any) ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repeticiones</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} value={(field.value as any) ?? ""} />
                    </FormControl>
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
                  <FormLabel>Notas o descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ej: Conseguido en el entrenamiento de fuerza base, me sentí muy estable..." className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Guardando..." : "Guardar Récord"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
