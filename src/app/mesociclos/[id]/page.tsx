import { db } from "@/db";
import { mesocycles, trainingDays, prescribedExercises } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { PhaseBadge } from "@/components/shared/phase-badge";
import { PurposeBadge } from "@/components/shared/purpose-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar, Clock, Dumbbell, Award, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTrainingDay, deletePrescribedExercise } from "@/actions/mesocycles";
import { PURPOSE_LABELS } from "@/lib/constants";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function MesocycleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const mesoId = Number(id);

  if (isNaN(mesoId)) {
    notFound();
  }

  // Consultar mesociclo con relaciones completas
  const meso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.id, mesoId),
    with: {
      trainingDays: {
        orderBy: [asc(trainingDays.dayNumber)],
        with: {
          prescribedExercises: {
            orderBy: [asc(prescribedExercises.order)],
            with: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  if (!meso) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Botón volver */}
      <Button variant="ghost" size="sm" render={<Link href="/mesociclos" className="flex items-center gap-1" />} className="-mb-4">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a mesociclos</span>
      </Button>

      {/* Cabecera */}
      <PageHeader
        title={meso.name}
        description={meso.description || "Programación de entrenamiento estructurada."}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/mesociclos/${meso.id}/editar`} />}>
            <Edit className="h-4 w-4 mr-1.5" />
            Editar Parámetros
          </Button>

          <Button size="sm" render={<Link href={`/mesociclos/${meso.id}/dia/nuevo`} />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Agregar Día
          </Button>
        </div>
      </PageHeader>

      {/* Resumen del Mesociclo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 border rounded-lg p-5 text-sm">
        <div className="space-y-1">
          <span className="text-muted-foreground block text-xs">Fase de Periodización</span>
          <PhaseBadge phase={meso.phase} />
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground block text-xs">Duración del Bloque</span>
          <strong className="text-base font-extrabold text-foreground">{meso.totalWeeks} semanas</strong>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground block text-xs">Descarga Planificada</span>
          <strong className="text-base font-extrabold text-foreground">Semana {meso.deloadWeek}</strong>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground block text-xs">Fecha de Inicio</span>
          <strong className="text-base font-bold text-foreground">
            {meso.startDate ? meso.startDate : "No iniciada"}
          </strong>
        </div>
      </div>

      {/* Lista de Días de Entrenamiento */}
      <div className="space-y-6">
        <div className="border-b pb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Días de Entrenamiento Programados ({meso.trainingDays.length})
          </h2>
        </div>

        {meso.trainingDays.length === 0 ? (
          <EmptyState
            title="No hay días programados"
            description="Agrega días a tu mesociclo (ej: Empuje, Jalón, Pierna) para comenzar a prescribir ejercicios."
            icon={Calendar}
          >
            <Button size="sm" render={<Link href={`/mesociclos/${meso.id}/dia/nuevo`} />}>
              Agregar Día
            </Button>
          </EmptyState>
        ) : (
          <div className="space-y-6">
            {meso.trainingDays.map((day) => (
              <Card key={day.id} className="border shadow-xs">
                {/* Cabecera del día */}
                <CardHeader className="bg-muted/40 border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg font-bold">
                        {day.name}
                      </CardTitle>
                      <Badge variant="outline" className="font-extrabold text-xs">
                        Día #{day.dayNumber}
                      </Badge>
                      {day.focus && (
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase px-2 py-0.5">
                          Enfoque: {day.focus}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button variant="outline" size="sm" render={<Link href={`/mesociclos/${meso.id}/dia/${day.id}/ejercicio/nuevo`} />} className="h-8 text-xs font-bold">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Prescribir Ejercicio
                    </Button>

                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="¿Eliminar día de entrenamiento?"
                      description={`¿Estás seguro de que deseas eliminar "${day.name}"? Esto borrará permanentemente todos los ejercicios prescritos asociados a este día.`}
                      confirmText="Eliminar"
                      onConfirm={async () => {
                        "use server";
                        return deleteTrainingDay(day.id, mesoId);
                      }}
                    />
                  </div>
                </CardHeader>

                {/* Ejercicios prescritos */}
                <CardContent className="p-6">
                  {day.prescribedExercises.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs border border-dashed rounded-lg bg-card">
                      <Dumbbell className="h-6 w-6 mx-auto mb-2 text-muted-foreground opacity-60" />
                      <p className="font-medium">No hay ejercicios prescritos para este día.</p>
                      <Button variant="link" size="sm" render={<Link href={`/mesociclos/${meso.id}/dia/${day.id}/ejercicio/nuevo`} />} className="text-xs text-primary font-bold mt-2">
                        Prescribir primer ejercicio
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {day.prescribedExercises.map((pe) => (
                        <div
                          key={pe.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-background hover:shadow-xs transition-shadow gap-4"
                        >
                          <div className="space-y-2">
                            {/* Línea 1: Nombre y badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-foreground">
                                {pe.order}. {pe.exercise.name}
                              </span>
                              <PurposeBadge purpose={pe.purpose as any} />
                            </div>

                            {/* Línea 2: Parámetros */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <strong>{pe.sets}</strong> series
                              </span>
                              <span>·</span>
                              <span>
                                <strong>{pe.repsMin}-{pe.repsMax}</strong> reps
                              </span>
                              <span>·</span>
                              <span className="text-amber-700 font-bold">
                                @ {pe.rpeTarget} RPE
                              </span>
                              {pe.restSeconds > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {Math.floor(pe.restSeconds / 60)}m {pe.restSeconds % 60}s descanso
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Notas del ejercicio */}
                            {pe.notes && (
                              <p className="text-xs text-slate-600 bg-slate-50 border rounded px-3 py-1.5 max-w-xl">
                                <strong>Nota:</strong> {pe.notes}
                              </p>
                            )}

                            {/* Deload configs */}
                            {(pe.deloadSets || pe.deloadRpe) && (
                              <div className="text-[10px] text-blue-700 bg-blue-50/50 border border-blue-100 rounded px-2 py-1 max-w-xs font-semibold">
                                Descarga: {pe.deloadSets ? `${pe.deloadSets} series` : ""} {pe.deloadRpe ? `@ ${pe.deloadRpe} RPE` : ""}
                              </div>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <ConfirmDialog
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              title="¿Eliminar ejercicio prescrito?"
                              description={`¿Estás seguro de que deseas eliminar la prescripción de "${pe.exercise.name}"?`}
                              confirmText="Eliminar"
                              onConfirm={async () => {
                                "use server";
                                return deletePrescribedExercise(pe.id, mesoId);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
