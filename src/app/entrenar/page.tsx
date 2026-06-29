import { db } from "@/db";
import { mesocycles, trainingDays } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { startWorkoutSession } from "@/actions/workouts";
import { Dumbbell, Play, Calendar, Zap } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function EntrenarPage() {
  // Consultar mesociclo activo
  const activeMeso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.isActive, true),
    with: {
      trainingDays: {
        orderBy: [asc(trainingDays.dayNumber)],
        with: {
          prescribedExercises: {
            with: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Registrar Sesión de Entrenamiento"
        description="Elige un día programado de tu mesociclo activo para entrenar o inicia una sesión libre independiente."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opción 1: Sesión Libre */}
        <Card className="flex flex-col justify-between border-slate-200">
          <CardHeader>
            <div className="p-2.5 bg-slate-100 rounded-full text-slate-700 w-fit mb-3">
              <Zap className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold">Sesión Libre</CardTitle>
            <CardDescription className="text-xs">
              Registra un entrenamiento independiente sin estructura de mesociclo. Podrás agregar los ejercicios al vuelo.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-2">
            <form 
              action={async () => {
                "use server";
                await startWorkoutSession(null);
              }}
              className="w-full"
            >
              <Button type="submit" className="w-full font-bold">
                <Play className="h-4 w-4 fill-current mr-1.5" />
                Iniciar Sesión Libre
              </Button>
            </form>
          </CardFooter>
        </Card>

        {/* Opción 2: Mesociclo Activo (si existe) */}
        {activeMeso ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="p-2.5 bg-primary/10 rounded-full text-primary w-fit mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold">Mesociclo: {activeMeso.name}</CardTitle>
              <CardDescription className="text-xs">
                Fase: {activeMeso.phase} · Selecciona uno de tus días de entrenamiento programados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80">Días Disponibles</h4>
              {activeMeso.trainingDays.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hay días programados en este mesociclo.</p>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {activeMeso.trainingDays.map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/10 transition-colors text-xs"
                    >
                      <div>
                        <strong className="block text-slate-800">{day.name}</strong>
                        <span className="text-muted-foreground text-[10px]">
                          {day.prescribedExercises.length} ejercicios prescritos
                        </span>
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await startWorkoutSession(day.id);
                        }}
                      >
                        <Button type="submit" size="sm" className="h-8 text-xs font-bold">
                          Iniciar
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col justify-between border-dashed bg-muted/20">
            <CardHeader>
              <div className="p-2.5 bg-muted rounded-full text-muted-foreground w-fit mb-3">
                <Calendar className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold">Sin Mesociclo Activo</CardTitle>
              <CardDescription className="text-xs">
                Para entrenar de forma planificada y comparar tu rendimiento con metas de volumen y RPE, primero debes crear y activar un mesociclo.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button variant="outline" render={<Link href="/mesociclos/nuevo" />} className="w-full font-bold">
                Crear Mesociclo
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
