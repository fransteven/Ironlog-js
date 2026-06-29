import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Smile, Award, Dumbbell } from "lucide-react";
import { setVolume } from "@/lib/calculations";

interface SessionSummaryProps {
  session: {
    id: number;
    date: string;
    title: string | null;
    notes: string | null;
    durationMinutes: number | null;
    bodyweightKg: string | null;
    isDeload: boolean | null;
    perceivedEnergy: number | null;
    exerciseLogs: {
      id: number;
      exercise: {
        name: string;
        primaryMuscle: string;
      };
      sets: {
        id: number;
        setNumber: number;
        weightKg: string;
        repsCompleted: number;
        rpe: string | null;
        isWarmup: boolean | null;
      }[];
    }[];
  };
  prs?: {
    id: number;
    weightKg: string;
    reps: number;
    estimated1rm: string | null;
    exercise: {
      name: string;
    };
  }[];
}

export function SessionSummary({ session, prs = [] }: SessionSummaryProps) {
  // Calcular estadísticas generales
  const totalSets = session.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
  const workingSets = session.exerciseLogs.reduce(
    (acc, log) => acc + log.sets.filter(s => !s.isWarmup).length, 
    0
  );
  
  const totalVolume = session.exerciseLogs.reduce((acc, log) => {
    return acc + log.sets.reduce((setAcc, set) => {
      return setAcc + setVolume(Number(set.weightKg), set.repsCompleted, set.isWarmup ?? false);
    }, 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Tarjeta de Encabezado */}
      <Card className="bg-card shadow-sm border overflow-hidden">
        <div className="bg-muted/40 border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              {session.date}
            </span>
            <CardTitle className="text-2xl font-extrabold">{session.title || "Sesión de Entrenamiento"}</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {session.isDeload && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Descarga (Deload)
              </Badge>
            )}
            {session.bodyweightKg && (
              <Badge variant="outline">
                {session.bodyweightKg} kg corporal
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Fila de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 border rounded-lg p-3 text-center">
              <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Volumen Total</span>
              <span className="text-xl font-bold">{Math.round(totalVolume)} kg</span>
            </div>

            <div className="bg-muted/30 border rounded-lg p-3 text-center">
              <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Series Totales</span>
              <span className="text-xl font-bold">{totalSets} <span className="text-xs font-normal text-muted-foreground">({workingSets} efec.)</span></span>
            </div>

            <div className="bg-muted/30 border rounded-lg p-3 text-center">
              <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Duración
              </span>
              <span className="text-xl font-bold">{session.durationMinutes || "-"} min</span>
            </div>

            <div className="bg-muted/30 border rounded-lg p-3 text-center">
              <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                <Smile className="h-3.5 w-3.5" />
                Energía
              </span>
              <span className="text-xl font-bold">{session.perceivedEnergy || "-"}/10</span>
            </div>
          </div>

          {session.notes && (
            <div className="mb-6 bg-slate-50 border rounded-lg p-4 text-sm text-slate-700">
              <h5 className="font-bold text-slate-800 mb-1">Notas de la sesión:</h5>
              <p className="whitespace-pre-wrap leading-relaxed">{session.notes}</p>
            </div>
          )}

          {/* Récords Personales Detectados */}
          {prs.length > 0 && (
            <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 mb-6">
              <h5 className="font-bold text-amber-800 flex items-center gap-1.5 text-sm mb-3">
                <Award className="h-4 w-4 fill-amber-100 text-amber-700" />
                🏆 RÉCORDS PERSONALES DETECTADOS EN ESTA SESIÓN
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prs.map((pr) => (
                  <div key={pr.id} className="bg-background border border-amber-200/60 rounded p-3 text-xs flex justify-between items-center shadow-xs">
                    <div>
                      <span className="font-bold block text-slate-800">{pr.exercise.name}</span>
                      <span className="text-muted-foreground">Serie: {pr.weightKg} kg × {pr.reps} reps</span>
                    </div>
                    {pr.estimated1rm && (
                      <Badge className="bg-amber-100 text-amber-800 border-none font-bold">
                        e1RM: {pr.estimated1rm} kg
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Ejercicios del Entrenamiento */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" />
              Ejercicios Realizados
            </h5>

            <div className="space-y-3">
              {session.exerciseLogs.map((log) => {
                const logVol = log.sets.reduce(
                  (acc, s) => acc + setVolume(Number(s.weightKg), s.repsCompleted, s.isWarmup ?? false),
                  0
                );
                
                return (
                  <div key={log.id} className="border rounded-lg p-4 bg-background">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <div>
                        <h6 className="font-bold text-sm text-foreground">{log.exercise.name}</h6>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          {log.exercise.primaryMuscle}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Volumen: <strong>{Math.round(logVol)} kg</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {log.sets.map((set) => (
                        <div 
                          key={set.id} 
                          className={`text-xs px-2.5 py-1.5 rounded border ${set.isWarmup ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-primary/5 border-primary/10 text-foreground'}`}
                        >
                          <span className="font-semibold block text-[10px] text-muted-foreground uppercase text-center mb-0.5">
                            Serie {set.setNumber}
                          </span>
                          <span className="font-bold block text-center">
                            {set.weightKg}kg × {set.repsCompleted} {set.isWarmup && <span className="text-[9px] font-normal">(C)</span>}
                          </span>
                          {set.rpe && (
                            <span className="block text-[10px] text-center text-amber-700 font-semibold mt-0.5">
                              @{set.rpe}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
