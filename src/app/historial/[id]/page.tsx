import { db } from "@/db";
import { workoutSessions, personalRecords, exerciseLogs, setLogs } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { SessionSummary } from "@/components/workouts/session-summary";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function SessionSummaryDetailPage({ params }: PageProps) {
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
    },
  });

  if (!session) {
    notFound();
  }

  // 2. Consultar PRs asociados a esta sesión si hay series registradas
  const setIds = session.exerciseLogs.flatMap((log) => log.sets.map((s) => s.id));

  const prs = setIds.length > 0
    ? await db.query.personalRecords.findMany({
        where: inArray(personalRecords.setLogId, setIds),
        with: {
          exercise: true,
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" render={<Link href="/historial" className="flex items-center gap-1" />} className="-mb-4">
          <ChevronLeft className="h-4 w-4" />
          <span>Volver al historial</span>
        </Button>
      </div>

      <PageHeader
        title="Resumen del Entrenamiento"
        description="Visualiza las estadísticas de volumen, series de trabajo y récords personales obtenidos en esta sesión."
      />

      <SessionSummary 
        session={session as any} 
        prs={prs as any} 
      />
    </div>
  );
}
