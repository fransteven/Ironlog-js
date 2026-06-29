"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, MUSCLE_LABELS, EQUIPMENT_LABELS } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { useTransition } from "react";

export function ExerciseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "ALL";
  const currentMuscle = searchParams.get("muscle") || "ALL";
  const currentEquipment = searchParams.get("equipment") || "ALL";

  function updateFilters(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "ALL" || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/ejercicios?${params.toString()}`);
    });
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    updateFilters({ q: e.target.value });
  }

  function clearFilters() {
    startTransition(() => {
      router.push("/ejercicios");
    });
  }

  const hasActiveFilters = currentSearch || currentCategory !== "ALL" || currentMuscle !== "ALL" || currentEquipment !== "ALL";

  return (
    <div className="flex flex-col gap-4 bg-muted/40 p-4 rounded-lg border mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ejercicio..."
            value={currentSearch}
            onChange={handleSearchChange}
            className="pl-9 bg-background"
          />
        </div>

        {/* Filtrar por Categoría */}
        <Select
          value={currentCategory}
          onValueChange={(val) => updateFilters({ category: val })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtrar por Grupo Muscular */}
        <Select
          value={currentMuscle}
          onValueChange={(val) => updateFilters({ muscle: val })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Músculo principal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los músculos</SelectItem>
            {Object.entries(MUSCLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtrar por Equipamiento */}
        <Select
          value={currentEquipment}
          onValueChange={(val) => updateFilters({ equipment: val })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Equipamiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todo el equipamiento</SelectItem>
            {Object.entries(EQUIPMENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            {isPending ? "Filtrando..." : "Filtros activos"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5" />
            <span>Limpiar filtros</span>
          </Button>
        </div>
      )}
    </div>
  );
}
