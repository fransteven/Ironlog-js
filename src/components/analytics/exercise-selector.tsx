"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface ExerciseSelectorProps {
  exercises: { id: number; name: string; primaryMuscle: string }[];
  selectedId: number | null;
}

export function ExerciseSelector({ exercises, selectedId }: ExerciseSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sortedExercises = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

  function handleValueChange(val: string | null) {
    if (!val) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("exerciseId", val);
    
    startTransition(() => {
      router.push(`/analitica?${params.toString()}`);
    });
  }

  return (
    <div className="flex items-center gap-3 bg-muted/40 p-4 border rounded-lg max-w-md">
      <div className="flex-1">
        <label className="block text-[10px] uppercase font-bold text-muted-foreground mb-1">
          Ejercicio Seleccionado
        </label>
        <Select
          value={selectedId ? String(selectedId) : undefined}
          onValueChange={handleValueChange}
          disabled={isPending}
        >
          <SelectTrigger className="bg-background font-semibold">
            <SelectValue placeholder="Selecciona un ejercicio..." />
          </SelectTrigger>
          <SelectContent>
            {sortedExercises.map((ex) => (
              <SelectItem key={ex.id} value={String(ex.id)}>
                {ex.name} ({ex.primaryMuscle})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isPending && (
        <div className="flex items-center justify-center shrink-0 self-end pb-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
