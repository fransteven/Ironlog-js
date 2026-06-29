import { db } from "@/db";
import { mesocycles, workoutSessions, personalRecords, setLogs, exerciseLogs } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PhaseBadge } from "@/components/shared/phase-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, Flame, Award, Plus, ArrowRight, Play, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { currentWeek } from "@/lib/calculations";

export const revalidate = 0; // Evitar cacheado estático para que el dashboard sea interactivo

export default async function DashboardPage() {
  // 1. Consultar Mesociclo Activo
  const activeMeso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.isActive, true),
    with: {
      trainingDays: {
        with: {
          prescribedExercises: true,
        },
      },
    },
  });

  // 2. Consultar Sesiones Recientes (últimas 5)
  const recentSessions = await db.query.workoutSessions.findMany({
    limit: 5,
    orderBy: [desc(workoutSessions.date), desc(workoutSessions.createdAt)],
    with: {
      exerciseLogs: {
        with: {
          exercise: true,
          sets: true,
        },
      },
      trainingDay: true,
    },
  });

  // 3. Consultar Récords Recientes (últimos 5)
  const recentPRs = await db.query.personalRecords.findMany({
    limit: 5,
    orderBy: [desc(personalRecords.date), desc(personalRecords.createdAt)],
    with: {
      exercise: true,
    },
  });

  // 4. Estadísticas Semanales (últimos 7 días)
  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  
  const weekSessions = await db.query.workoutSessions.findMany({
    where: gte(workoutSessions.date, weekAgoStr),
  });

  const weekSets = await db.select({
    weightKg: setLogs.weightKg,
    repsCompleted: setLogs.repsCompleted,
  })
  .from(setLogs)
  .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
  .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
  .where(
    and(
      gte(workoutSessions.date, weekAgoStr),
      eq(setLogs.isWarmup, false)
    )
  );

  const weekVolume = weekSets.reduce((sum, set) => sum + Number(set.weightKg) * set.repsCompleted, 0);

  // Calcular la semana actual del mesociclo activo
  const weekNumber = activeMeso ? currentWeek(activeMeso.startDate, activeMeso.totalWeeks) : null;
  const isDeloadWeek = activeMeso && weekNumber === activeMeso.deloadWeek;

  return (
    <div className="space-y-8">
      {/* Saludo y bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">¡Hola de nuevo!</h1>
          <p className="text-muted-foreground text-sm">Este es el estado actual de tu rendimiento físico y planificación.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link href="/mesociclos/nuevo" />}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo Mesociclo
          </Button>
          <Button size="sm" render={<Link href="/entrenar" />}>
            <Play className="h-4 w-4 fill-current mr-1.5" />
            Entrenar Ahora
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mesociclo Activo"
          value={activeMeso ? activeMeso.name : "Ninguno"}
          icon={Calendar}
          description={
            activeMeso 
              ? `${activeMeso.totalWeeks} semanas · Fase: ${activeMeso.phase}` 
              : "Crea o activa un mesociclo para planificar."
          }
          className={activeMeso ? "border-primary/20 bg-primary/5" : ""}
        />
        <StatCard
          title="Entrenamientos (7d)"
          value={weekSessions.length}
          icon={Flame}
          description="Sesiones registradas en la última semana."
        />
        <StatCard
          title="Volumen Semanal (7d)"
          value={`${Math.round(weekVolume).toLocaleString()} kg`}
          icon={TrendingUp}
          description="Tonelaje movilizado en series de trabajo."
        />
        <StatCard
          title="Récords Personales (PRs)"
          value={recentPRs.length > 0 ? "Activo" : "0"}
          icon={Award}
          description={recentPRs.length > 0 ? `${recentPRs.length} nuevos recientemente.` : "Registra series pesadas para desbloquear PRs."}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda/Centro: Mesociclo Activo y Sesiones Recientes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mesociclo Activo Detalle */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Mesociclo Activo</CardTitle>
                <CardDescription className="text-xs">Estado de tu programación de entrenamiento actual</CardDescription>
              </div>
              {activeMeso && <PhaseBadge phase={activeMeso.phase} />}
            </CardHeader>
            <CardContent>
              {activeMeso ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">Semana de Progreso</span>
                      <strong className="text-lg font-extrabold text-primary">
                        {weekNumber ? `Semana ${weekNumber} de ${activeMeso.totalWeeks}` : "Programado / Sin iniciar"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Semana de Descarga</span>
                      <strong className="text-base font-semibold">Semana {activeMeso.deloadWeek}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">Intensidad</span>
                      <strong className="text-base font-semibold">{activeMeso.strengthPct}% prom.</strong>
                    </div>
                  </div>

                  {activeMeso.description && (
                    <p className="text-sm text-slate-700 italic">"{activeMeso.description}"</p>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Días de Entrenamiento en la Semana</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeMeso.trainingDays.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Aún no has agregado días de entrenamiento a este mesociclo.</p>
                      ) : (
                        activeMeso.trainingDays.map((day) => (
                          <Link
                            key={day.id}
                            href={`/mesociclos/${activeMeso.id}`}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors text-xs"
                          >
                            <span className="font-semibold">{day.name}</span>
                            <span className="text-muted-foreground text-[10px]">
                              {day.prescribedExercises.length} ejercicios prescritos
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No hay ningún mesociclo activo"
                  description="Crea un mesociclo estructurado para planificar tus días de entrenamiento, series, repeticiones y RPEs objetivos basados en periodización."
                  icon={Calendar}
                >
                  <Button size="sm" render={<Link href="/mesociclos/nuevo" />}>
                    Crear Mesociclo
                  </Button>
                </EmptyState>
              )}
            </CardContent>
          </Card>

          {/* Sesiones Recientes */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Sesiones de Entrenamiento Recientes</CardTitle>
                <CardDescription className="text-xs">Tus últimos registros de actividad</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/historial" className="flex items-center gap-1" />} className="text-xs font-bold">
                <span>Ver Historial</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <EmptyState
                  title="Aún no has registrado entrenamientos"
                  description="Empieza a registrar tus series de entrenamiento libremente o vinculándolas a tu mesociclo activo."
                  icon={Dumbbell}
                >
                  <Button size="sm" render={<Link href="/entrenar" />}>
                    Comenzar a Entrenar
                  </Button>
                </EmptyState>
              ) : (
                <div className="divide-y border rounded-lg overflow-hidden bg-card">
                  {recentSessions.map((session) => {
                    const sessionVol = session.exerciseLogs.reduce((acc, log) => {
                      return acc + log.sets.reduce((setAcc, set) => {
                        return setAcc + (set.isWarmup ? 0 : Number(set.weightKg) * set.repsCompleted);
                      }, 0);
                    }, 0);
                    
                    return (
                      <Link
                        key={session.id}
                        href={`/historial/${session.id}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-muted/30 transition-colors text-sm"
                      >
                        <div className="space-y-1">
                          <strong className="block font-bold text-slate-800">{session.title || "Sesión de Entrenamiento"}</strong>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {session.date} {session.durationMinutes ? `· ${session.durationMinutes} min` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className="block font-bold text-slate-800 text-xs sm:text-sm">
                              {Math.round(sessionVol).toLocaleString()} kg
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase block">Volumen</span>
                          </div>
                          <div className="text-right border-l pl-3">
                            <span className="block font-bold text-slate-800 text-xs sm:text-sm">
                              {session.exerciseLogs.length}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase block">Ejercicios</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Récords Personales (PRs) */}
        <div className="space-y-8">
          <Card className="h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Récords Personales (PRs)</CardTitle>
                <CardDescription className="text-xs">Tus mejores marcas estimadas (e1RM)</CardDescription>
              </div>
              <Button variant="ghost" size="sm" render={<Link href="/records" className="flex items-center gap-1" />} className="text-xs font-bold">
                <span>Ver Todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentPRs.length === 0 ? (
                <EmptyState
                  title="Sin récords registrados"
                  description="Los récords se detectan automáticamente al registrar series efectivas con altos pesos o RPEs."
                  icon={Award}
                />
              ) : (
                <div className="space-y-3">
                  {recentPRs.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card text-xs transition-shadow hover:shadow-xs relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                      <div className="space-y-0.5 pl-1.5">
                        <strong className="block font-bold text-slate-800">{pr.exercise.name}</strong>
                        <span className="text-[10px] text-muted-foreground">
                          {pr.weightKg} kg × {pr.reps} {pr.reps === 1 ? "rep" : "reps"}
                        </span>
                      </div>
                      {pr.estimated1rm && (
                        <div className="text-right">
                          <span className="block font-bold text-amber-700">e1RM: {pr.estimated1rm} kg</span>
                          <span className="text-[9px] text-muted-foreground">{pr.date}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
