import { db } from "@/db";
import { mesocycles, trainingDays } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { startWorkoutSession } from "@/actions/workouts";
import { Zap, Calendar, Play, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PHASE_LABELS } from "@/lib/constants";

export const revalidate = 0;

const dayColors = [
  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/10" },
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/10" },
  { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/10" },
  { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/10" },
  { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/10" },
];

export default async function EntrenarPage() {
  const activeMeso = await db.query.mesocycles.findFirst({
    where: eq(mesocycles.isActive, true),
    with: {
      trainingDays: {
        orderBy: [asc(trainingDays.dayNumber)],
        with: { prescribedExercises: { with: { exercise: true } } },
      },
    },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          Entrenar
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Elige tu sesión de hoy</p>
      </div>

      <div className="space-y-4">
        {/* Sesión libre — amber */}
        <div className="relative rounded-2xl border border-amber-500/12 bg-amber-500/5 p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full bg-amber-500/5" />
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Sesión Libre</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sin estructura · Agrega ejercicios al vuelo
              </p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await startWorkoutSession(null);
            }}
          >
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400 text-sm font-semibold hover:bg-amber-500/15 transition-colors"
            >
              Iniciar Sesión Libre
            </button>
          </form>
        </div>

        {/* Mesociclo activo — blue */}
        {activeMeso ? (
          <div className="rounded-2xl border border-blue-500/12 bg-blue-500/5 p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">{activeMeso.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {PHASE_LABELS[activeMeso.phase as keyof typeof PHASE_LABELS] ?? activeMeso.phase}
                </p>
              </div>
            </div>

            {activeMeso.trainingDays.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No hay días programados.{" "}
                <Link href={`/mesociclos/${activeMeso.id}`} className="text-primary underline-offset-2 hover:underline">
                  Agregar días
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Selecciona tu día
                </p>
                {activeMeso.trainingDays.map((day, i) => {
                  const c = dayColors[i % dayColors.length];
                  return (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-background/60 border border-border hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${c.text}`}>{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{day.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {day.prescribedExercises.length} ejercicios
                            {day.prescribedExercises.length > 0 &&
                              ` · ${day.prescribedExercises.map((pe) => pe.exercise?.name.split(" ")[0]).slice(0, 3).join(", ")}`}
                          </p>
                        </div>
                      </div>
                      <form
                        action={async () => {
                          "use server";
                          await startWorkoutSession(day.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(59,130,246,0.35)] hover:opacity-90 transition-opacity"
                        >
                          <Play className="h-3.5 w-3.5 fill-white text-white" />
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Sin Mesociclo Activo</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Crea y activa un mesociclo para entrenar de forma planificada.
                </p>
              </div>
            </div>
            <Button variant="outline" render={<Link href="/mesociclos/nuevo" className="flex items-center gap-1.5" />} className="w-full">
              <ChevronRight className="h-4 w-4" />
              Crear Mesociclo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
