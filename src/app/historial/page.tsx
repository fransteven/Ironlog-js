import { db } from "@/db";
import { workoutSessions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteWorkoutSession } from "@/actions/workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Smile, Trash2, Eye, Dumbbell, Play } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";

export const revalidate = 0;

export default async function HistoryPage() {
  const user = await requireUser();

  // Consultar sesiones completadas o en curso (ADMIN ve todas; USER solo las propias)
  const sessions = await db.query.workoutSessions.findMany({
    where: user.role === "ADMIN" ? undefined : eq(workoutSessions.userId, user.id),
    orderBy: [desc(workoutSessions.date), desc(workoutSessions.createdAt)],
    with: {
      exerciseLogs: {
        with: {
          sets: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Entrenamientos"
        description="Revisa tus entrenamientos pasados, analiza el tonelaje movilizado y el esfuerzo acumulado."
      />

      {sessions.length === 0 ? (
        <EmptyState
          title="Historial vacío"
          description="Aún no has registrado ninguna sesión de entrenamiento. ¡Comienza una hoy!"
          icon={Dumbbell}
        >
          <Button size="sm" render={<Link href="/entrenar" />}>
            Comenzar a Entrenar
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {sessions.map((session) => {
            const totalSets = session.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
            const workingSets = session.exerciseLogs.reduce((acc, log) => acc + log.sets.filter(s => !s.isWarmup).length, 0);
            const volume = session.exerciseLogs.reduce((acc, log) => {
              return acc + log.sets.reduce((setAcc, set) => {
                return setAcc + (set.isWarmup ? 0 : Number(set.weightKg) * set.repsCompleted);
              }, 0);
            }, 0);

            const isPendingSession = session.durationMinutes === null;

            return (
              <Card 
                key={session.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-sm ${isPendingSession ? 'border-amber-300 bg-amber-50/15' : 'bg-card'}`}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-base text-slate-800">
                        {session.title || "Sesión de Entrenamiento"}
                      </span>
                      {session.isDeload && (
                        <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 uppercase font-bold">
                          Descarga
                        </Badge>
                      )}
                      {isPendingSession && (
                        <Badge className="text-[9px] bg-amber-100 text-amber-800 hover:bg-amber-100/80 border-none font-bold uppercase tracking-wider">
                          En Curso / Incompleta
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {session.date}
                      </span>
                      {session.durationMinutes && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.durationMinutes} min
                          </span>
                        </>
                      )}
                      {session.perceivedEnergy && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Smile className="h-3.5 w-3.5" />
                            Energía {session.perceivedEnergy}/10
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-1.5 text-xs">
                      <div>
                        Volumen: <strong className="font-extrabold text-slate-800">{Math.round(volume).toLocaleString()} kg</strong>
                      </div>
                      <div>
                        Ejercicios: <strong className="font-extrabold text-slate-800">{session.exerciseLogs.length}</strong>
                      </div>
                      <div>
                        Series: <strong className="font-extrabold text-slate-800">{totalSets} <span className="font-normal text-muted-foreground">({workingSets} efec.)</span></strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isPendingSession ? (
                      <Button size="sm" variant="default" render={<Link href={`/entrenar/${session.id}`} className="flex items-center gap-1" />} className="h-9 text-xs font-bold">
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Continuar</span>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" render={<Link href={`/historial/${session.id}`} className="flex items-center gap-1" />} className="h-9 text-xs font-bold">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Resumen</span>
                      </Button>
                    )}

                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      }
                      title="¿Eliminar entrenamiento del historial?"
                      description={`¿Estás seguro de que deseas eliminar permanentemente el entrenamiento "${session.title || 'Sesión'}"? Esta acción borrará todas sus series registradas y récords personales asociados. No se puede deshacer.`}
                      confirmText="Eliminar"
                      onConfirm={async () => {
                        "use server";
                        return deleteWorkoutSession(session.id);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
