import { PageHeader } from "@/components/layout/page-header";
import { TrainingDayForm } from "@/components/mesocycles/training-day-form";
import { createTrainingDay } from "@/actions/mesocycles";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { mesocycles } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewTrainingDayPage({ params }: PageProps) {
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

  const createActionWithMesoId = createTrainingDay.bind(null, mesoId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Agregar Día a: ${meso.name}`}
        description="Agrega una nueva sesión o día de entrenamiento a la semana de este mesociclo."
      />
      <div className="flex justify-start">
        <TrainingDayForm action={createActionWithMesoId} />
      </div>
    </div>
  );
}
