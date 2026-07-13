import { z } from "zod";

export const exerciseSchema = z.object({
  name:             z.string().min(1, "Requerido").max(200),
  category:         z.enum(["PRIMARY", "SECONDARY", "ACCESSORY", "STABILIZER"]),
  primaryMuscle:    z.enum(["CHEST", "BACK", "SHOULDERS", "QUADS", "HAMSTRINGS", "GLUTES",
                            "TRICEPS", "BICEPS", "CORE", "CALVES", "TRAPS", "FOREARMS", "FULL_BODY"]),
  secondaryMuscles: z.string().optional().default(""),
  equipment:        z.enum(["BARBELL", "DUMBBELL", "MACHINE", "CABLE", "BODYWEIGHT", "BAND"]),
  movementPattern:  z.enum(["SQUAT", "HINGE", "H_PUSH", "H_PULL", "V_PUSH", "V_PULL",
                             "ISOLATION", "CARRY", "ANTI_MOVEMENT"]),
  description:      z.string().optional().default(""),
  isUnilateral:     z.boolean().optional().default(false),
  isIsometric:      z.boolean().optional().default(false),
});

export const mesocycleSchema = z.object({
  name:         z.string().min(1).max(200),
  phase:        z.enum(["ACCUMULATION", "TRANSMUTATION", "MAX_STRENGTH",
                         "REALIZATION", "HYPERTROPHY", "GENERAL"]),
  totalWeeks:   z.coerce.number().int().min(1).max(12).default(4),
  deloadWeek:   z.coerce.number().int().min(1).default(4),
  startDate:    z.string().optional().nullable(),
  description:  z.string().optional().default(""),
  strengthPct:  z.coerce.number().int().min(0).max(100).default(65),
  isActive:     z.boolean().optional().default(true),
  order:        z.coerce.number().int().min(1).default(1),
});

export const trainingDaySchema = z.object({
  name:      z.string().min(1).max(100),
  dayNumber: z.coerce.number().int().min(1).default(1),
  focus:     z.string().optional().default(""),
});

export const prescribedExerciseSchema = z.object({
  exerciseId:   z.coerce.number().int().positive("Debes seleccionar un ejercicio"),
  order:        z.coerce.number().int().min(1).default(1),
  sets:         z.coerce.number().int().min(1, "Mínimo 1 serie").default(3),
  repsMin:      z.coerce.number().int().min(1, "Mínimo 1 repetición").default(6),
  repsMax:      z.coerce.number().int().min(1, "Mínimo 1 repetición").default(8),
  intensityMin: z.coerce.number().min(0).max(100).optional().nullable(),
  intensityMax: z.coerce.number().min(0).max(100).optional().nullable(),
  rpeTarget:    z.coerce.number().min(5).max(10).default(8.0),
  restSeconds:  z.coerce.number().int().min(0).default(120),
  purpose:      z.enum(["STRENGTH", "HYPERTROPHY", "STABILIZER", "POWER"]).default("STRENGTH"),
  notes:        z.string().optional().default(""),
  deloadSets:   z.coerce.number().int().min(1).optional().nullable(),
  deloadRpe:    z.coerce.number().min(5).max(10).optional().nullable(),
});

export const workoutSessionSchema = z.object({
  date:            z.string().min(1),
  trainingDayId:   z.coerce.number().int().positive().optional().nullable(),
  title:           z.string().optional().default(""),
  isDeload:        z.boolean().optional().default(false),
  bodyweightKg:    z.coerce.number().positive().optional().nullable(),
  perceivedEnergy: z.coerce.number().int().min(1).max(10).optional().nullable(),
});

export const setLogSchema = z.object({
  exerciseId:    z.coerce.number().int().positive(),
  weightKg:      z.coerce.number().min(0, "Mínimo 0"),
  repsCompleted: z.coerce.number().int().min(0, "Mínimo 0"),
  rpe:           z.coerce.number().min(5).max(10).optional().nullable(),
  isWarmup:      z.boolean().optional().default(false),
  notes:         z.string().optional().default(""),
});

export const finishSessionSchema = z.object({
  durationMinutes: z.coerce.number().int().min(1).optional().nullable(),
  perceivedEnergy: z.coerce.number().int().min(1).max(10).optional().nullable(),
  notes:           z.string().optional().default(""),
});

export const personalRecordSchema = z.object({
  exerciseId: z.coerce.number().int().positive(),
  recordType: z.enum(["1RM", "E1RM", "REP_PR"]),
  weightKg:   z.coerce.number().positive(),
  reps:       z.coerce.number().int().min(1).default(1),
  date:       z.string().min(1),
  notes:      z.string().optional().default(""),
});

export const loginSchema = z.object({
  email:    z.string().min(1, "Requerido").email("Email inválido"),
  password: z.string().min(1, "Requerido"),
});
