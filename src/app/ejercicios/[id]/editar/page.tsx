import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { updateExercise } from "@/actions/exercises";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditExercisePage({ params }: PageProps) {
  const { id } = await params;
  const exId = Number(id);

  if (isNaN(exId)) {
    notFound();
  }

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exId),
  });

  if (!exercise) {
    notFound();
  }

  // Bind del id de forma segura a la acción de actualización
  const updateActionWithId = updateExercise.bind(null, exId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar Ejercicio: ${exercise.name}`}
        description="Actualiza la información técnica o la descripción de este movimiento."
      />
      <div className="flex justify-start">
        <ExerciseForm 
          defaultValues={{
            name: exercise.name,
            category: exercise.category as any,
            primaryMuscle: exercise.primaryMuscle as any,
            secondaryMuscles: exercise.secondaryMuscles || "",
            equipment: exercise.equipment as any,
            movementPattern: exercise.movementPattern as any,
            description: exercise.description || "",
            isUnilateral: exercise.isUnilateral || false,
            isIsometric: exercise.isIsometric || false,
          }}
          action={updateActionWithId} 
        />
      </div>
    </div>
  );
}
