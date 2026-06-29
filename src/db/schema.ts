import { pgTable, pgEnum, text, integer, numeric, boolean, date, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───
export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "PRIMARY", "SECONDARY", "ACCESSORY", "STABILIZER"
]);

export const muscleGroupEnum = pgEnum("muscle_group", [
  "CHEST", "BACK", "SHOULDERS", "QUADS", "HAMSTRINGS", "GLUTES",
  "TRICEPS", "BICEPS", "CORE", "CALVES", "TRAPS", "FOREARMS", "FULL_BODY"
]);

export const equipmentEnum = pgEnum("equipment", [
  "BARBELL", "DUMBBELL", "MACHINE", "CABLE", "BODYWEIGHT", "BAND"
]);

export const movementPatternEnum = pgEnum("movement_pattern", [
  "SQUAT", "HINGE", "H_PUSH", "H_PULL", "V_PUSH", "V_PULL",
  "ISOLATION", "CARRY", "ANTI_MOVEMENT"
]);

export const phaseEnum = pgEnum("mesocycle_phase", [
  "ACCUMULATION", "TRANSMUTATION", "MAX_STRENGTH",
  "REALIZATION", "HYPERTROPHY", "GENERAL"
]);

export const purposeEnum = pgEnum("exercise_purpose", [
  "STRENGTH", "HYPERTROPHY", "STABILIZER", "POWER"
]);

export const recordTypeEnum = pgEnum("record_type", [
  "1RM", "E1RM", "REP_PR"
]);

// ─── Tablas ───

// ─── Exercise ───
export const exercises = pgTable("exercises", {
  id:              serial("id").primaryKey(),
  name:            text("name").notNull(),
  category:        exerciseCategoryEnum("category").notNull(),
  primaryMuscle:   muscleGroupEnum("primary_muscle").notNull(),
  secondaryMuscles: text("secondary_muscles").default(""),
  equipment:       equipmentEnum("equipment").notNull(),
  movementPattern: movementPatternEnum("movement_pattern").notNull(),
  description:     text("description").default(""),
  isUnilateral:    boolean("is_unilateral").default(false),
  isIsometric:     boolean("is_isometric").default(false),
});

// ─── Mesocycle ───
export const mesocycles = pgTable("mesocycles", {
  id:           serial("id").primaryKey(),
  name:         text("name").notNull(),
  phase:        phaseEnum("phase").notNull(),
  totalWeeks:   integer("total_weeks").notNull().default(4),
  deloadWeek:   integer("deload_week").notNull().default(4),
  startDate:    date("start_date"),
  description:  text("description").default(""),
  strengthPct:  integer("strength_pct").notNull().default(65),
  isActive:     boolean("is_active").default(true),
  order:        integer("order").notNull().default(1),
  createdAt:    timestamp("created_at").$defaultFn(() => new Date()),
});

// ─── TrainingDay ───
export const trainingDays = pgTable("training_days", {
  id:          serial("id").primaryKey(),
  mesocycleId: integer("mesocycle_id").notNull().references(() => mesocycles.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  dayNumber:   integer("day_number").notNull().default(1),
  focus:       text("focus").default(""),
});

// ─── PrescribedExercise ───
export const prescribedExercises = pgTable("prescribed_exercises", {
  id:            serial("id").primaryKey(),
  trainingDayId: integer("training_day_id").notNull().references(() => trainingDays.id, { onDelete: "cascade" }),
  exerciseId:    integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  order:         integer("order").notNull().default(1),
  sets:          integer("sets").notNull().default(3),
  repsMin:       integer("reps_min").notNull().default(6),
  repsMax:       integer("reps_max").notNull().default(8),
  intensityMin:  numeric("intensity_min", { precision: 4, scale: 1 }),
  intensityMax:  numeric("intensity_max", { precision: 4, scale: 1 }),
  rpeTarget:     numeric("rpe_target", { precision: 3, scale: 1 }).default("8.0"),
  restSeconds:   integer("rest_seconds").notNull().default(120),
  purpose:       purposeEnum("purpose").notNull().default("STRENGTH"),
  notes:         text("notes").default(""),
  deloadSets:    integer("deload_sets"),
  deloadRpe:     numeric("deload_rpe", { precision: 3, scale: 1 }),
});

// ─── WorkoutSession ───
export const workoutSessions = pgTable("workout_sessions", {
  id:              serial("id").primaryKey(),
  date:            date("date").notNull().$defaultFn(() => new Date().toISOString().split("T")[0]),
  trainingDayId:   integer("training_day_id").references(() => trainingDays.id, { onDelete: "set null" }),
  title:           text("title").default(""),
  notes:           text("notes").default(""),
  durationMinutes: integer("duration_minutes"),
  bodyweightKg:    numeric("bodyweight_kg", { precision: 5, scale: 1 }),
  isDeload:        boolean("is_deload").default(false),
  perceivedEnergy: integer("perceived_energy"),
  createdAt:       timestamp("created_at").$defaultFn(() => new Date()),
});

// ─── ExerciseLog ───
export const exerciseLogs = pgTable("exercise_logs", {
  id:         serial("id").primaryKey(),
  sessionId:  integer("session_id").notNull().references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  order:      integer("order").notNull().default(1),
  notes:      text("notes").default(""),
});

// ─── SetLog ───
export const setLogs = pgTable("set_logs", {
  id:             serial("id").primaryKey(),
  exerciseLogId:  integer("exercise_log_id").notNull().references(() => exerciseLogs.id, { onDelete: "cascade" }),
  setNumber:      integer("set_number").notNull().default(1),
  weightKg:       numeric("weight_kg", { precision: 6, scale: 1 }).notNull().default("0"),
  repsCompleted:  integer("reps_completed").notNull().default(0),
  rpe:            numeric("rpe", { precision: 3, scale: 1 }),
  isWarmup:       boolean("is_warmup").default(false),
  tempo:          text("tempo").default(""),
  notes:          text("notes").default(""),
});

// ─── PersonalRecord ───
export const personalRecords = pgTable("personal_records", {
  id:           serial("id").primaryKey(),
  exerciseId:   integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  recordType:   recordTypeEnum("record_type").notNull(),
  weightKg:     numeric("weight_kg", { precision: 6, scale: 1 }).notNull(),
  reps:         integer("reps").notNull().default(1),
  estimated1rm: numeric("estimated_1rm", { precision: 6, scale: 1 }),
  date:         date("date").notNull(),
  setLogId:     integer("set_log_id").references(() => setLogs.id, { onDelete: "set null" }),
  notes:        text("notes").default(""),
  createdAt:    timestamp("created_at").$defaultFn(() => new Date()),
});

// ─── BodyweightEntry ───
export const bodyweightEntries = pgTable("bodyweight_entries", {
  id:       serial("id").primaryKey(),
  date:     date("date").notNull().unique(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }).notNull(),
  notes:    text("notes").default(""),
});

// ─── Relaciones ───

export const mesocycleRelations = relations(mesocycles, ({ many }) => ({
  trainingDays: many(trainingDays),
}));

export const trainingDayRelations = relations(trainingDays, ({ one, many }) => ({
  mesocycle:           one(mesocycles, { fields: [trainingDays.mesocycleId], references: [mesocycles.id] }),
  prescribedExercises: many(prescribedExercises),
  sessions:            many(workoutSessions),
}));

export const prescribedExerciseRelations = relations(prescribedExercises, ({ one }) => ({
  trainingDay: one(trainingDays, { fields: [prescribedExercises.trainingDayId], references: [trainingDays.id] }),
  exercise:    one(exercises, { fields: [prescribedExercises.exerciseId], references: [exercises.id] }),
}));

export const workoutSessionRelations = relations(workoutSessions, ({ one, many }) => ({
  trainingDay:  one(trainingDays, { fields: [workoutSessions.trainingDayId], references: [trainingDays.id] }),
  exerciseLogs: many(exerciseLogs),
}));

export const exerciseLogRelations = relations(exerciseLogs, ({ one, many }) => ({
  session:  one(workoutSessions, { fields: [exerciseLogs.sessionId], references: [workoutSessions.id] }),
  exercise: one(exercises, { fields: [exerciseLogs.exerciseId], references: [exercises.id] }),
  sets:     many(setLogs),
}));

export const setLogRelations = relations(setLogs, ({ one }) => ({
  exerciseLog: one(exerciseLogs, { fields: [setLogs.exerciseLogId], references: [exerciseLogs.id] }),
}));

export const personalRecordRelations = relations(personalRecords, ({ one }) => ({
  exercise: one(exercises, { fields: [personalRecords.exerciseId], references: [exercises.id] }),
  setLog:   one(setLogs, { fields: [personalRecords.setLogId], references: [setLogs.id] }),
}));
