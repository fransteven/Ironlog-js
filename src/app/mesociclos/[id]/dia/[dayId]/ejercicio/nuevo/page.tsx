import { db } from "@/db";
import { mesocycles, trainingDays, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { PrescribedExerciseForm } from "@/components/mesocycles/prescribed-exercise-form";
import { createPrescribedExercise } from "@/actions/mesocycles";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
    dayId: string;
  }>;
}

export default async function NewPrescribedExercisePage({ params }: PageProps) {
  const { id, dayId } = await params;
  const mesoId = Number(id);
  const tDayId = Number(dayId);

  if (isNaN(mesoId) || isNaN(tDayId)) {
    notFound();
  }

  // Verificar mesociclo y día
  const meso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.id, mesoId),
  });

  const day = await db.query.trainingDays.findFirst({
    where: eq(trainingDays.id, tDayId),
  });

  if (!meso || !day) {
    notFound();
  }

  // Obtener lista completa de ejercicios
  const exerciseList = await db.select().from(exercises);

  const prescribeAction = createPrescribedExercise.bind(null, tDayId, mesoId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Prescribir Ejercicio en: ${day.name}`}
        description={`Define las series, repeticiones y la intensidad objetivo para este ejercicio en la semana ordinaria y semana de descarga.`}
      />
      <div className="flex justify-start">
        <PrescribedExerciseForm 
          exercises={exerciseList} 
          action={prescribeAction} 
        />
      </div>
    </div>
  );
}
