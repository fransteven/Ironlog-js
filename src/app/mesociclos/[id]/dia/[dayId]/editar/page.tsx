import { db } from "@/db";
import { trainingDays } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { TrainingDayForm } from "@/components/mesocycles/training-day-form";
import { updateTrainingDay } from "@/actions/mesocycles";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    dayId: string;
  }>;
}

export default async function EditTrainingDayPage({ params }: PageProps) {
  const { id, dayId } = await params;
  const mesoId = Number(id);
  const tDayId = Number(dayId);

  if (isNaN(mesoId) || isNaN(tDayId)) {
    notFound();
  }

  const day = await db.query.trainingDays.findFirst({
    where: eq(trainingDays.id, tDayId),
  });

  if (!day) {
    notFound();
  }

  const updateAction = updateTrainingDay.bind(null, tDayId, mesoId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Día: ${day.name}`}
        description="Actualiza el nombre, número de día o enfoque de este día de entrenamiento."
      />
      <div className="flex justify-start">
        <TrainingDayForm
          defaultValues={{
            name: day.name,
            dayNumber: day.dayNumber,
            focus: day.focus || "",
          }}
          action={updateAction}
        />
      </div>
    </div>
  );
}
