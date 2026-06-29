import { PageHeader } from "@/components/layout/page-header";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { createExercise } from "@/actions/exercises";

export default function NewExercisePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Ejercicio"
        description="Agrega un ejercicio personalizado al catálogo para usarlo en tus rutinas y mesociclos."
      />
      <div className="flex justify-start">
        <ExerciseForm action={createExercise} />
      </div>
    </div>
  );
}
