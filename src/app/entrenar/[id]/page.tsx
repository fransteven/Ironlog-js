import { db } from "@/db";
import { workoutSessions, exerciseLogs, setLogs, exercises, prescribedExercises } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { LoggingPanel } from "@/components/workouts/logging-panel";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function WorkoutLoggingPage({ params }: PageProps) {
  const { id } = await params;
  const sessionId = Number(id);

  if (isNaN(sessionId)) {
    notFound();
  }

  // 1. Consultar detalles de la sesión
  const session = await db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, sessionId),
    with: {
      exerciseLogs: {
        orderBy: [asc(exerciseLogs.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: [asc(setLogs.setNumber)],
          },
        },
      },
      trainingDay: true,
    },
  });

  if (!session) {
    notFound();
  }

  const user = await requireUser();
  if (user.role !== "ADMIN" && session.userId !== user.id) {
    notFound();
  }

  // 2. Obtener catálogo de ejercicios para el buscador
  const exerciseList = await db.select({
    id: exercises.id,
    name: exercises.name,
    primaryMuscle: exercises.primaryMuscle,
  }).from(exercises);

  // 3. Consultar las marcas anteriores (para el auto-fill)
  const allSetLogs = await db
    .select({
      exerciseId: exerciseLogs.exerciseId,
      weightKg: setLogs.weightKg,
      repsCompleted: setLogs.repsCompleted,
      rpe: setLogs.rpe,
    })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
    .where(eq(setLogs.isWarmup, false))
    .orderBy(desc(workoutSessions.date), desc(setLogs.id));

  const lastSetsMap: Record<number, { weightKg: number; repsCompleted: number; rpe: number | null }> = {};
  for (const log of allSetLogs) {
    if (!lastSetsMap[log.exerciseId]) {
      lastSetsMap[log.exerciseId] = {
        weightKg: Number(log.weightKg),
        repsCompleted: log.repsCompleted,
        rpe: log.rpe ? Number(log.rpe) : null,
      };
    }
  }

  // 4. Mapear prescripciones del día si está vinculada
  const prescribedMap: Record<number, { sets: number; repsMin: number; repsMax: number; rpeTarget: string }> = {};
  if (session.trainingDayId) {
    const prescribed = await db.query.prescribedExercises.findMany({
      where: eq(prescribedExercises.trainingDayId, session.trainingDayId),
    });
    for (const p of prescribed) {
      prescribedMap[p.exerciseId] = {
        sets: p.sets,
        repsMin: p.repsMin,
        repsMax: p.repsMax,
        rpeTarget: p.rpeTarget || "8.0",
      };
    }
  }

  return (
    <LoggingPanel
      sessionId={sessionId}
      sessionDate={session.date}
      sessionTitle={session.title || ""}
      exercises={exerciseList}
      lastSetsData={lastSetsMap}
      exerciseLogsList={session.exerciseLogs}
      prescribedMap={prescribedMap}
      finalizarHref={`/entrenar/${session.id}/finalizar`}
    />
  );
}
