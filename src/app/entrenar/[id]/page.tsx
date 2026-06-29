import { db } from "@/db";
import { workoutSessions, exerciseLogs, setLogs, exercises, prescribedExercises } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { SetLogger } from "@/components/workouts/set-logger";
import { SetTable } from "@/components/workouts/set-table";
import { Button } from "@/components/ui/button";
import { addSet } from "@/actions/workouts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4 mb-4">
        <div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
            Registro Activo · {session.date}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {session.title || "Sesión de Entrenamiento"}
          </h1>
        </div>
        
        <Button size="sm" render={<Link href={`/entrenar/${session.id}/finalizar`} className="flex items-center gap-1.5" />} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Finalizar Sesión</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logger panel (izquierda/arriba en móvil) */}
        <div className="lg:col-span-1 space-y-4">
          <SetLogger
            sessionId={sessionId}
            exercises={exerciseList}
            lastSetsData={lastSetsMap}
            action={addSet}
          />
        </div>

        {/* Set Table (derecha/abajo en móvil) */}
        <div className="lg:col-span-2 space-y-4">
          <SetTable
            sessionId={sessionId}
            exerciseLogsList={session.exerciseLogs}
            prescribedMap={prescribedMap}
          />
        </div>
      </div>
    </div>
  );
}
