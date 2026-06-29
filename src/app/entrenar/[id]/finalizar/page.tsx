import { db } from "@/db";
import { workoutSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { FinishForm } from "@/components/workouts/finish-form";
import { finishWorkoutSession } from "@/actions/workouts";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FinishWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const sessionId = Number(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  const session = await db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, sessionId),
  });

  if (!session) {
    notFound();
  }

  const finishAction = finishWorkoutSession.bind(null, sessionId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finalizar Entrenamiento"
        description={`Registra la duración de la sesión, tu nivel de energía y cualquier comentario o molestia física antes de guardar.`}
      />
      <div className="flex justify-start">
        <FinishForm action={finishAction} />
      </div>
    </div>
  );
}
