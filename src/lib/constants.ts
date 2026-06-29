export const PHASE_COLORS = {
  ACCUMULATION: "#3B82F6", TRANSMUTATION: "#8B5CF6",
  MAX_STRENGTH: "#EF4444", REALIZATION:   "#F59E0B",
  HYPERTROPHY:  "#10B981", GENERAL:       "#6B7280",
} as const;

export const PHASE_LABELS = {
  ACCUMULATION: "Acumulación",  TRANSMUTATION: "Transmutación",
  MAX_STRENGTH: "Fuerza máxima", REALIZATION:  "Realización / Pico",
  HYPERTROPHY:  "Hipertrofia",   GENERAL:      "General",
} as const;

export const CATEGORY_LABELS = {
  PRIMARY: "Primario", SECONDARY: "Secundario",
  ACCESSORY: "Accesorio", STABILIZER: "Estabilizador",
} as const;

export const MUSCLE_LABELS = {
  CHEST: "Pecho", BACK: "Espalda", SHOULDERS: "Hombros",
  QUADS: "Cuádriceps", HAMSTRINGS: "Isquiotibiales", GLUTES: "Glúteos",
  TRICEPS: "Tríceps", BICEPS: "Bíceps", CORE: "Core",
  CALVES: "Pantorrillas", TRAPS: "Trapecios", FOREARMS: "Antebrazos",
  FULL_BODY: "Cuerpo completo",
} as const;

export const EQUIPMENT_LABELS = {
  BARBELL: "Barra olímpica", DUMBBELL: "Mancuernas", MACHINE: "Máquina",
  CABLE: "Polea / Cable", BODYWEIGHT: "Peso corporal", BAND: "Banda elástica",
} as const;

export const PATTERN_LABELS = {
  SQUAT: "Sentadilla", HINGE: "Bisagra", H_PUSH: "Empuje H",
  H_PULL: "Jalón H", V_PUSH: "Empuje V", V_PULL: "Jalón V",
  ISOLATION: "Aislamiento", CARRY: "Acarreo", ANTI_MOVEMENT: "Anti-movimiento",
} as const;

export const PURPOSE_LABELS = {
  STRENGTH: "Fuerza", HYPERTROPHY: "Hipertrofia",
  STABILIZER: "Estabilizador", POWER: "Potencia",
} as const;

export function rpeColor(rpe: number): string {
  if (rpe >= 9.5) return "#DC2626";
  if (rpe >= 9)   return "#EF4444";
  if (rpe >= 8)   return "#F59E0B";
  if (rpe >= 7)   return "#10B981";
  return "#6B7280";
}
