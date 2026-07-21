"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MUSCLE_LABELS } from "@/lib/constants";

interface ExerciseComboboxProps {
  exercises: { id: number; name: string; primaryMuscle: string }[];
  value: number | null;
  onChange: (id: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExerciseCombobox({
  exercises,
  value,
  onChange,
  placeholder = "Selecciona un ejercicio...",
  disabled,
}: ExerciseComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = value != null ? exercises.find((ex) => ex.id === value) : undefined;

  // Agrupar por músculo primario y ordenar alfabéticamente dentro de cada grupo.
  const groups = new Map<string, { id: number; name: string; primaryMuscle: string }[]>();
  for (const ex of exercises) {
    const arr = groups.get(ex.primaryMuscle) ?? [];
    arr.push(ex);
    groups.set(ex.primaryMuscle, arr);
  }

  const labelFor = (muscle: string) =>
    (MUSCLE_LABELS as Record<string, string>)[muscle] ?? muscle;

  const sortedGroups = [...groups.entries()]
    .map(([muscle, list]) => ({
      muscle,
      list: [...list].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => labelFor(a.muscle).localeCompare(labelFor(b.muscle)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between font-semibold"
          >
            <span className={selected ? "" : "text-muted-foreground"}>
              {selected ? selected.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar ejercicio..." />
          <CommandList>
            <CommandEmpty>No se encontró.</CommandEmpty>
            {sortedGroups.map(({ muscle, list }) => (
              <CommandGroup key={muscle} heading={labelFor(muscle)}>
                {list.map((ex) => (
                  <CommandItem
                    key={ex.id}
                    value={ex.name}
                    data-checked={ex.id === value ? "true" : undefined}
                    onSelect={() => {
                      onChange(ex.id);
                      setOpen(false);
                    }}
                  >
                    {ex.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
