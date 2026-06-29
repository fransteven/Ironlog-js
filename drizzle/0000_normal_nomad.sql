CREATE TYPE "public"."equipment" AS ENUM('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'BAND');--> statement-breakpoint
CREATE TYPE "public"."exercise_category" AS ENUM('PRIMARY', 'SECONDARY', 'ACCESSORY', 'STABILIZER');--> statement-breakpoint
CREATE TYPE "public"."movement_pattern" AS ENUM('SQUAT', 'HINGE', 'H_PUSH', 'H_PULL', 'V_PUSH', 'V_PULL', 'ISOLATION', 'CARRY', 'ANTI_MOVEMENT');--> statement-breakpoint
CREATE TYPE "public"."muscle_group" AS ENUM('CHEST', 'BACK', 'SHOULDERS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'TRICEPS', 'BICEPS', 'CORE', 'CALVES', 'TRAPS', 'FOREARMS', 'FULL_BODY');--> statement-breakpoint
CREATE TYPE "public"."mesocycle_phase" AS ENUM('ACCUMULATION', 'TRANSMUTATION', 'MAX_STRENGTH', 'REALIZATION', 'HYPERTROPHY', 'GENERAL');--> statement-breakpoint
CREATE TYPE "public"."exercise_purpose" AS ENUM('STRENGTH', 'HYPERTROPHY', 'STABILIZER', 'POWER');--> statement-breakpoint
CREATE TYPE "public"."record_type" AS ENUM('1RM', 'E1RM', 'REP_PR');--> statement-breakpoint
CREATE TABLE "bodyweight_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 1) NOT NULL,
	"notes" text DEFAULT '',
	CONSTRAINT "bodyweight_entries_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "exercise_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" "exercise_category" NOT NULL,
	"primary_muscle" "muscle_group" NOT NULL,
	"secondary_muscles" text DEFAULT '',
	"equipment" "equipment" NOT NULL,
	"movement_pattern" "movement_pattern" NOT NULL,
	"description" text DEFAULT '',
	"is_unilateral" boolean DEFAULT false,
	"is_isometric" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "mesocycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phase" "mesocycle_phase" NOT NULL,
	"total_weeks" integer DEFAULT 4 NOT NULL,
	"deload_week" integer DEFAULT 4 NOT NULL,
	"start_date" date,
	"description" text DEFAULT '',
	"strength_pct" integer DEFAULT 65 NOT NULL,
	"is_active" boolean DEFAULT true,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_id" integer NOT NULL,
	"record_type" "record_type" NOT NULL,
	"weight_kg" numeric(6, 1) NOT NULL,
	"reps" integer DEFAULT 1 NOT NULL,
	"estimated_1rm" numeric(6, 1),
	"date" date NOT NULL,
	"set_log_id" integer,
	"notes" text DEFAULT '',
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prescribed_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"training_day_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"sets" integer DEFAULT 3 NOT NULL,
	"reps_min" integer DEFAULT 6 NOT NULL,
	"reps_max" integer DEFAULT 8 NOT NULL,
	"intensity_min" numeric(4, 1),
	"intensity_max" numeric(4, 1),
	"rpe_target" numeric(3, 1) DEFAULT '8.0',
	"rest_seconds" integer DEFAULT 120 NOT NULL,
	"purpose" "exercise_purpose" DEFAULT 'STRENGTH' NOT NULL,
	"notes" text DEFAULT '',
	"deload_sets" integer,
	"deload_rpe" numeric(3, 1)
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_log_id" integer NOT NULL,
	"set_number" integer DEFAULT 1 NOT NULL,
	"weight_kg" numeric(6, 1) DEFAULT '0' NOT NULL,
	"reps_completed" integer DEFAULT 0 NOT NULL,
	"rpe" numeric(3, 1),
	"is_warmup" boolean DEFAULT false,
	"tempo" text DEFAULT '',
	"notes" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "training_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"mesocycle_id" integer NOT NULL,
	"name" text NOT NULL,
	"day_number" integer DEFAULT 1 NOT NULL,
	"focus" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"training_day_id" integer,
	"title" text DEFAULT '',
	"notes" text DEFAULT '',
	"duration_minutes" integer,
	"bodyweight_kg" numeric(5, 1),
	"is_deload" boolean DEFAULT false,
	"perceived_energy" integer,
	"created_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_set_log_id_set_logs_id_fk" FOREIGN KEY ("set_log_id") REFERENCES "public"."set_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescribed_exercises" ADD CONSTRAINT "prescribed_exercises_training_day_id_training_days_id_fk" FOREIGN KEY ("training_day_id") REFERENCES "public"."training_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescribed_exercises" ADD CONSTRAINT "prescribed_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_log_id_exercise_logs_id_fk" FOREIGN KEY ("exercise_log_id") REFERENCES "public"."exercise_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_days" ADD CONSTRAINT "training_days_mesocycle_id_mesocycles_id_fk" FOREIGN KEY ("mesocycle_id") REFERENCES "public"."mesocycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_training_day_id_training_days_id_fk" FOREIGN KEY ("training_day_id") REFERENCES "public"."training_days"("id") ON DELETE set null ON UPDATE no action;