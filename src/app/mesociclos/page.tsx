import { db } from "@/db";
import { mesocycles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MesocycleCard } from "@/components/mesocycles/mesocycle-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { deleteMesocycle } from "@/actions/mesocycles";

export const revalidate = 0;

export default async function MesocyclesPage() {
  const mesocyclesList = await db.query.mesocycles.findMany({
    orderBy: [desc(mesocycles.isActive), desc(mesocycles.createdAt)],
    with: { trainingDays: true },
  });

  const active = mesocyclesList.filter((m) => m.isActive);
  const rest = mesocyclesList.filter((m) => !m.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Programa
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tus mesociclos de entrenamiento
          </p>
        </div>
        <Button render={<Link href="/mesociclos/nuevo" className="flex items-center gap-1.5" />} className="shadow-[0_2px_12px_rgba(59,130,246,0.25)]">
          <Plus className="h-4 w-4" />
          Nuevo Mesociclo
        </Button>
      </div>

      {mesocyclesList.length === 0 ? (
        <EmptyState
          title="No hay mesociclos creados"
          description="Crea tu primer mesociclo para comenzar a programar tus semanas de entrenamiento."
          icon={Calendar}
        >
          <Button size="sm" render={<Link href="/mesociclos/nuevo" />}>Crear Mesociclo</Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {/* Active section */}
          {active.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Activo
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((meso) => (
                  <MesocycleCard
                    key={meso.id}
                    mesocycle={{ ...meso, trainingDaysCount: meso.trainingDays.length }}
                    onDelete={async () => {
                      "use server";
                      return deleteMesocycle(meso.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                {active.length > 0 ? "Otros" : "Todos"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((meso) => (
                  <MesocycleCard
                    key={meso.id}
                    mesocycle={{ ...meso, trainingDaysCount: meso.trainingDays.length }}
                    onDelete={async () => {
                      "use server";
                      return deleteMesocycle(meso.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
