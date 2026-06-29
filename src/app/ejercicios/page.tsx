import { db } from "@/db";
import { exercises } from "@/db/schema";
import { ilike, eq, and, asc } from "drizzle-orm";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Dumbbell } from "lucide-react";
import Link from "next/link";
import { CATEGORY_LABELS, MUSCLE_LABELS, EQUIPMENT_LABELS } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    muscle?: string;
    equipment?: string;
  }>;
}

export const revalidate = 0;

const categoryColors: Record<string, string> = {
  PRIMARY:    "bg-blue-500/10 text-blue-400 border-blue-500/15",
  SECONDARY:  "bg-violet-500/10 text-violet-400 border-violet-500/15",
  ACCESSORY:  "bg-amber-500/10 text-amber-400 border-amber-500/15",
  STABILIZER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
};

export default async function ExercisesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "ALL";
  const muscle = params.muscle || "ALL";
  const equipment = params.equipment || "ALL";

  const conditions = [];
  if (q) conditions.push(ilike(exercises.name, `%${q}%`));
  if (category !== "ALL") conditions.push(eq(exercises.category, category as any));
  if (muscle !== "ALL") conditions.push(eq(exercises.primaryMuscle, muscle as any));
  if (equipment !== "ALL") conditions.push(eq(exercises.equipment, equipment as any));

  const exerciseList = await db
    .select()
    .from(exercises)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Ejercicios
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {exerciseList.length} ejercicio{exerciseList.length !== 1 ? "s" : ""} en el catálogo
          </p>
        </div>
        <Button render={<Link href="/ejercicios/nuevo" className="flex items-center gap-1.5" />} className="shadow-[0_2px_12px_rgba(59,130,246,0.25)]">
          <Plus className="h-4 w-4" />
          Nuevo Ejercicio
        </Button>
      </div>

      {/* Filters */}
      <ExerciseFilters />

      {/* Table */}
      {exerciseList.length === 0 ? (
        <EmptyState
          title="No se encontraron ejercicios"
          description="Intenta con otros filtros o crea un nuevo ejercicio."
          icon={Dumbbell}
        />
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Nombre</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden md:table-cell">Músculo</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Equipo</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hidden lg:table-cell">Detalles</th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {exerciseList.map((ex) => (
                <tr key={ex.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{ex.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryColors[ex.category] || "bg-muted text-muted-foreground border-border"}`}>
                      {CATEGORY_LABELS[ex.category as keyof typeof CATEGORY_LABELS] || ex.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {MUSCLE_LABELS[ex.primaryMuscle as keyof typeof MUSCLE_LABELS] || ex.primaryMuscle}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {EQUIPMENT_LABELS[ex.equipment as keyof typeof EQUIPMENT_LABELS] || ex.equipment}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {ex.isUnilateral && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-muted text-muted-foreground">
                          Unilateral
                        </span>
                      )}
                      {ex.isIsometric && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-muted text-muted-foreground">
                          Isométrico
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        render={<Link href={`/ejercicios/${ex.id}/editar`} />}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="¿Eliminar ejercicio?"
                        description={`¿Eliminar "${ex.name}"? Se perderán todos los registros históricos.`}
                        confirmText="Eliminar"
                        onConfirm={async () => {
                          "use server";
                          return deleteExercise(ex.id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
