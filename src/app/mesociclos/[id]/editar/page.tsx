import { db } from "@/db";
import { mesocycles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { MesocycleForm } from "@/components/mesocycles/mesocycle-form";
import { updateMesocycle } from "@/actions/mesocycles";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMesocyclePage({ params }: PageProps) {
  const { id } = await params;
  const mesoId = Number(id);

  if (isNaN(mesoId)) {
    notFound();
  }

  const meso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.id, mesoId),
  });

  if (!meso) {
    notFound();
  }

  const updateActionWithId = updateMesocycle.bind(null, mesoId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Mesociclo: ${meso.name}`}
        description="Actualiza la configuración, la fase o el estado activo de este bloque de entrenamiento."
      />
      <div className="flex justify-start">
        <MesocycleForm
          defaultValues={{
            name: meso.name,
            phase: meso.phase as any,
            totalWeeks: meso.totalWeeks,
            deloadWeek: meso.deloadWeek,
            startDate: meso.startDate,
            description: meso.description || "",
            strengthPct: meso.strengthPct,
            isActive: meso.isActive || false,
            order: meso.order,
          }}
          action={updateActionWithId}
        />
      </div>
    </div>
  );
}
