import { db } from "@/db";
import { mesocycles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { MesocycleCard } from "@/components/mesocycles/mesocycle-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { deleteMesocycle } from "@/actions/mesocycles";

export const revalidate = 0;

export default async function MesocyclesPage() {
  // Consultar todos los mesociclos
  const mesocyclesList = await db.query.mesocycles.findMany({
    orderBy: [desc(mesocycles.isActive), desc(mesocycles.createdAt)],
    with: {
      trainingDays: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mesociclos y Programación"
        description="Estructura tus bloques de entrenamiento (mesociclos) basados en fases de periodización, define tus días y prescribe los ejercicios objetivos."
      >
        <Button render={<Link href="/mesociclos/nuevo" className="flex items-center gap-1.5 font-bold" />}>
          <Plus className="h-4 w-4" />
          <span>Nuevo Mesociclo</span>
        </Button>
      </PageHeader>

      {mesocyclesList.length === 0 ? (
        <EmptyState
          title="No hay mesociclos creados"
          description="Crea tu primer mesociclo para comenzar a programar tus semanas de entrenamiento y registrar tu progreso de manera planificada."
          icon={Calendar}
        >
          <Button size="sm" render={<Link href="/mesociclos/nuevo" />}>Crear Mesociclo</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesocyclesList.map((meso) => (
            <MesocycleCard
              key={meso.id}
              mesocycle={{
                ...meso,
                trainingDaysCount: meso.trainingDays.length,
              }}
              onDelete={async () => {
                "use server";
                return deleteMesocycle(meso.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
