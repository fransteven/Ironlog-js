import { db } from "@/db";
import { exercises } from "@/db/schema";
import { ilike, eq, and, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteExercise } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default async function ExercisesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "ALL";
  const muscle = params.muscle || "ALL";
  const equipment = params.equipment || "ALL";

  // Construir filtros de Drizzle
  const conditions = [];

  if (q) {
    conditions.push(ilike(exercises.name, `%${q}%`));
  }
  if (category !== "ALL") {
    conditions.push(eq(exercises.category, category as any));
  }
  if (muscle !== "ALL") {
    conditions.push(eq(exercises.primaryMuscle, muscle as any));
  }
  if (equipment !== "ALL") {
    conditions.push(eq(exercises.equipment, equipment as any));
  }

  const queryCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Consultar base de datos
  const exerciseList = await db
    .select()
    .from(exercises)
    .where(queryCondition)
    .orderBy(asc(exercises.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Ejercicios"
        description="Explora los ejercicios disponibles o agrega movimientos personalizados a tu base de datos."
      >
        <Button render={<Link href="/ejercicios/nuevo" className="flex items-center gap-1.5 font-bold" />}>
          <Plus className="h-4 w-4" />
          <span>Nuevo Ejercicio</span>
        </Button>
      </PageHeader>

      {/* Panel de Filtros */}
      <ExerciseFilters />

      {/* Lista de Ejercicios */}
      {exerciseList.length === 0 ? (
        <EmptyState
          title="No se encontraron ejercicios"
          description="Intenta buscar con otros términos o filtros, o crea un nuevo ejercicio."
          icon={Dumbbell}
        />
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Músculo Principal</TableHead>
                <TableHead>Equipamiento</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exerciseList.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell className="font-bold text-slate-800 text-sm">
                    {ex.name}
                  </TableCell>
                  <TableCell className="text-xs">
                    {CATEGORY_LABELS[ex.category as keyof typeof CATEGORY_LABELS] || ex.category}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase">
                      {MUSCLE_LABELS[ex.primaryMuscle as keyof typeof MUSCLE_LABELS] || ex.primaryMuscle}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {EQUIPMENT_LABELS[ex.equipment as keyof typeof EQUIPMENT_LABELS] || ex.equipment}
                  </TableCell>
                  <TableCell className="text-xs space-x-1">
                    {ex.isUnilateral && (
                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 font-semibold border-slate-200">
                        Unilateral
                      </Badge>
                    )}
                    {ex.isIsometric && (
                      <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 font-semibold border-slate-200">
                        Isométrico
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" render={<Link href={`/ejercicios/${ex.id}/editar`} />} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Edit className="h-4 w-4" />
                    </Button>

                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="¿Eliminar ejercicio?"
                      description={`¿Estás seguro de que deseas eliminar "${ex.name}" de la base de datos? Esto eliminará todos los registros históricos de este ejercicio.`}
                      confirmText="Eliminar"
                      onConfirm={async () => {
                        "use server";
                        return deleteExercise(ex.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
