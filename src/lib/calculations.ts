/**
 * e1RM con Epley (1985) + ajuste RIR de Helms (2016).
 */
export function estimateE1RM(weight: number, reps: number, rpe?: number): number | null {
  if (weight <= 0 || reps <= 0) return null;
  if (reps === 1 && (!rpe || rpe >= 10)) return weight;

  let effectiveReps = reps;
  if (rpe !== undefined && rpe < 10) {
    effectiveReps = reps + (10 - rpe);
  }

  return Math.round(weight * (1 + effectiveReps / 30) * 10) / 10;
}

/** Volumen de una serie = peso × reps (0 si warmup). */
export function setVolume(weight: number, reps: number, isWarmup: boolean): number {
  return isWarmup ? 0 : Math.round(weight * reps * 10) / 10;
}

/** Semana actual dentro de un mesociclo. null si fuera de rango. */
export function currentWeek(startDate: string | null, totalWeeks: number): number | null {
  if (!startDate) return null;
  const diff = Date.now() - new Date(startDate).getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return week >= 1 && week <= totalWeeks ? week : null;
}
