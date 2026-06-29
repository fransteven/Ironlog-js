import { db } from "@/db";
import { mesocycles, workoutSessions, personalRecords, setLogs, exerciseLogs } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PhaseBadge } from "@/components/shared/phase-badge";
import { Button } from "@/components/ui/button";
import { Calendar, Flame, Award, Plus, ArrowRight, Play, TrendingUp, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { currentWeek } from "@/lib/calculations";
import { PHASE_COLORS } from "@/lib/constants";

export const revalidate = 0;

export default async function DashboardPage() {
  const activeMeso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.isActive, true),
    with: {
      trainingDays: {
        with: { prescribedExercises: true },
      },
    },
  });

  const recentSessions = await db.query.workoutSessions.findMany({
    limit: 5,
    orderBy: [desc(workoutSessions.date), desc(workoutSessions.createdAt)],
    with: {
      exerciseLogs: { with: { exercise: true, sets: true } },
      trainingDay: true,
    },
  });

  const recentPRs = await db.query.personalRecords.findMany({
    limit: 5,
    orderBy: [desc(personalRecords.date), desc(personalRecords.createdAt)],
    with: { exercise: true },
  });

  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const weekSessions = await db.query.workoutSessions.findMany({
    where: gte(workoutSessions.date, weekAgoStr),
  });

  const weekSets = await db
    .select({ weightKg: setLogs.weightKg, repsCompleted: setLogs.repsCompleted })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
    .where(and(gte(workoutSessions.date, weekAgoStr), eq(setLogs.isWarmup, false)));

  const weekVolume = weekSets.reduce(
    (sum, set) => sum + Number(set.weightKg) * set.repsCompleted,
    0
  );

  const weekNumber = activeMeso ? currentWeek(activeMeso.startDate, activeMeso.totalWeeks) : null;

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const dayColors = ["blue", "purple", "green", "amber", "red"] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{todayCapitalized}</p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Hola de nuevo
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" render={<Link href="/mesociclos/nuevo" className="flex items-center gap-1.5" />}>
            <Plus className="h-4 w-4" />
            Nuevo Mesociclo
          </Button>
          <Button size="sm" render={<Link href="/entrenar" className="flex items-center gap-1.5" />} className="shadow-[0_2px_12px_rgba(59,130,246,0.3)]">
            <Play className="h-4 w-4 fill-current" />
            Entrenar Ahora
          </Button>
        </div>
      </div>

      {/* Stat grid 2x2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Semana"
          value={weekNumber ?? "—"}
          valueSuffix={activeMeso ? `/ ${activeMeso.totalWeeks}` : undefined}
          icon={Calendar}
          color="blue"
          description={activeMeso?.name ?? "Sin mesociclo activo"}
        />
        <StatCard
          title="Entrenos"
          value={weekSessions.length}
          valueSuffix="/ 7d"
          icon={Flame}
          color="green"
          description="Sesiones esta semana"
        />
        <StatCard
          title="Volumen"
          value={weekVolume >= 1000 ? `${(weekVolume / 1000).toFixed(1)}k` : Math.round(weekVolume).toLocaleString()}
          valueSuffix="kg"
          icon={TrendingUp}
          color="amber"
          description="Tonelaje de trabajo (7d)"
        />
        <StatCard
          title="PRs nuevos"
          value={recentPRs.length}
          icon={Award}
          color="red"
          description="Récords recientes"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Mesociclo + Sesiones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mesociclo hero */}
          <div className={`rounded-2xl border p-5 space-y-4 ${
            activeMeso
              ? "bg-blue-500/8 border-blue-500/12"
              : "bg-card border-border"
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Mesociclo activo
                </p>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  {activeMeso?.name ?? "Sin mesociclo activo"}
                </h2>
              </div>
              {activeMeso && <PhaseBadge phase={activeMeso.phase} />}
            </div>

            {activeMeso ? (
              <>
                {/* Progress bar */}
                {weekNumber && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                        style={{ width: `${(weekNumber / activeMeso.totalWeeks) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Semana {weekNumber} de {activeMeso.totalWeeks}</span>
                      <span>Descarga: S{activeMeso.deloadWeek}</span>
                    </div>
                  </div>
                )}

                {/* Training days */}
                {activeMeso.trainingDays.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Entrenar hoy
                    </p>
                    <div className="space-y-2">
                      {activeMeso.trainingDays.map((day, i) => {
                        const color = dayColors[i % dayColors.length];
                        const colorClasses = {
                          blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   dot: "bg-blue-500" },
                          purple: { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-500" },
                          green:  { bg: "bg-emerald-500/10",text: "text-emerald-400",dot: "bg-emerald-500" },
                          amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  dot: "bg-amber-500" },
                          red:    { bg: "bg-red-500/10",    text: "text-red-400",    dot: "bg-red-500" },
                        };
                        const c = colorClasses[color];
                        return (
                          <Link
                            key={day.id}
                            href={`/mesociclos/${activeMeso.id}`}
                            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                                <span className={`text-xs font-bold ${c.text}`}>{i + 1}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{day.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {day.prescribedExercises.length} ejercicios prescritos
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeMeso.trainingDays.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aún no hay días en este mesociclo.{" "}
                    <Link href={`/mesociclos/${activeMeso.id}`} className="text-primary underline-offset-2 hover:underline">
                      Agregar días
                    </Link>
                  </p>
                )}
              </>
            ) : (
              <EmptyState
                title="No hay mesociclo activo"
                description="Crea un mesociclo para planificar días, series y RPEs."
                icon={Calendar}
              >
                <Button size="sm" render={<Link href="/mesociclos/nuevo" />}>
                  Crear Mesociclo
                </Button>
              </EmptyState>
            )}
          </div>

          {/* Sesiones recientes */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">Entrenamientos recientes</h2>
              <Link
                href="/historial"
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Ver historial <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <EmptyState
                title="Sin entrenamientos registrados"
                description="Empieza a registrar tus series."
                icon={Clock}
              >
                <Button size="sm" render={<Link href="/entrenar" />}>
                  Comenzar
                </Button>
              </EmptyState>
            ) : (
              <div className="divide-y divide-border">
                {recentSessions.map((session) => {
                  const sessionVol = session.exerciseLogs.reduce(
                    (acc, log) =>
                      acc + log.sets.reduce((s, set) => s + (set.isWarmup ? 0 : Number(set.weightKg) * set.repsCompleted), 0),
                    0
                  );
                  return (
                    <Link
                      key={session.id}
                      href={`/historial/${session.id}`}
                      className="flex items-center justify-between py-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {session.title || "Sesión de Entrenamiento"}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.date}
                          {session.durationMinutes && ` · ${session.durationMinutes} min`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="text-sm font-bold text-foreground">{Math.round(sessionVol).toLocaleString()} kg</p>
                          <p className="text-[9px] text-muted-foreground uppercase">Volumen</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{session.exerciseLogs.length}</p>
                          <p className="text-[9px] text-muted-foreground uppercase">Ejercicios</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: PRs */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">Récords (PRs)</h2>
            <Link
              href="/records"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentPRs.length === 0 ? (
            <EmptyState
              title="Sin récords aún"
              description="Se detectan automáticamente al registrar series pesadas."
              icon={Award}
            />
          ) : (
            <div className="space-y-2.5">
              {recentPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="relative flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 rounded-full" />
                  <div className="pl-2 space-y-0.5">
                    <p className="text-xs font-bold text-foreground">{pr.exercise.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {pr.weightKg} kg × {pr.reps} rep{pr.reps !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {pr.estimated1rm && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-amber-400">e1RM: {pr.estimated1rm} kg</p>
                      <p className="text-[9px] text-muted-foreground">{pr.date}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
