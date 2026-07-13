# AGENTS.md — IronLog (Next.js)

> Fuente de verdad para la implementación de IronLog.  
> Migración completa de Django → Next.js App Router.  
> Cualquier agente debe leer este archivo completo antes de ejecutar cualquier tarea.

---

## 1. Misión

IronLog es una aplicación web de registro y análisis de entrenamiento de fuerza e hipertrofia.
Aplica conceptos de periodización basada en evidencia (Issurin 2010, Helms 2016, Schoenfeld 2017) y es **transversal a cualquier rutina**.

**Funcionalidad core:**
- Crear programas con mesociclos, días y ejercicios prescritos
- Registrar sesiones (series, peso, reps, RPE) de forma libre o vinculada a un programa
- e1RM automático (Epley + ajuste RIR)
- Detección automática de PRs
- Analítica: progresión e1RM, volumen, RPE, distribución muscular
- Dashboard con resumen semanal y estado del mesociclo activo

---

## 2. Stack

```
Framework:      Next.js 15 · App Router · TypeScript · Server Actions
Base de datos:  NeonDB (PostgreSQL serverless)
ORM:            Drizzle ORM + drizzle-kit
Validación:     Zod (schemas) + React Hook Form (client)
UI:             shadcn/ui + TailwindCSS + Lucide Icons
Charts:         Recharts
Auth:           NextAuth (Auth.js v5) · Credentials · JWT · bcryptjs · roles ADMIN/USER
Testing:        Vitest (unit + integración contra Neon real)
```

### Dependencias exactas

```bash
# Core
npx create-next-app@latest ironlog --typescript --tailwind --eslint --app --src-dir

# DB + ORM
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Validación + Forms
pnpm add zod react-hook-form @hookform/resolvers

# Charts
pnpm add recharts

# Auth
pnpm add next-auth@beta bcryptjs
pnpm add -D @types/bcryptjs

# Testing
pnpm add -D vitest vite-tsconfig-paths tsx dotenv-cli

# UI (shadcn init + componentes)
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label select textarea badge
pnpm dlx shadcn@latest add table tabs dialog separator alert
pnpm dlx shadcn@latest add dropdown-menu sheet toast form
pnpm dlx shadcn@latest add progress checkbox command popover
```

**No instalar:** ORMs alternativos, Prisma, tRPC, Redux, Zustand, Chart.js. Solo lo de arriba (NextAuth/Auth.js v5 es la única solución de auth permitida).

---

## 3. Estructura del Proyecto

```
ironlog/
├── CLAUDE.md
├── AGENTS.md
├── drizzle.config.ts
├── .env.local                        ← DATABASE_URL=postgres://...neon.tech/ironlog
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← root layout, navbar, toaster
│   │   ├── page.tsx                  ← dashboard
│   │   ├── ejercicios/
│   │   │   ├── page.tsx              ← lista filtrable
│   │   │   ├── nuevo/page.tsx        ← crear
│   │   │   └── [id]/editar/page.tsx  ← editar
│   │   ├── mesociclos/
│   │   │   ├── page.tsx              ← lista
│   │   │   ├── nuevo/page.tsx        ← crear
│   │   │   └── [id]/
│   │   │       ├── page.tsx          ← detalle
│   │   │       ├── editar/page.tsx
│   │   │       ├── dia/nuevo/page.tsx
│   │   │       └── dia/[dayId]/
│   │   │           ├── editar/page.tsx
│   │   │           └── ejercicio/nuevo/page.tsx
│   │   ├── entrenar/
│   │   │   ├── page.tsx              ← iniciar sesión
│   │   │   ├── [id]/page.tsx         ← logging (client component)
│   │   │   └── [id]/finalizar/page.tsx
│   │   ├── historial/
│   │   │   ├── page.tsx              ← lista de sesiones
│   │   │   └── [id]/page.tsx         ← detalle
│   │   ├── analitica/
│   │   │   └── page.tsx              ← charts
│   │   └── records/
│   │       └── page.tsx              ← PR board
│   ├── components/
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── page-header.tsx
│   │   ├── exercises/
│   │   │   ├── exercise-form.tsx
│   │   │   └── exercise-filters.tsx
│   │   ├── mesocycles/
│   │   │   ├── mesocycle-form.tsx
│   │   │   ├── mesocycle-card.tsx
│   │   │   ├── training-day-form.tsx
│   │   │   └── prescribed-exercise-form.tsx
│   │   ├── workouts/
│   │   │   ├── session-form.tsx
│   │   │   ├── set-logger.tsx        ← componente core de logging
│   │   │   ├── set-table.tsx
│   │   │   ├── session-summary.tsx
│   │   │   └── finish-form.tsx
│   │   ├── analytics/
│   │   │   ├── e1rm-chart.tsx
│   │   │   ├── volume-chart.tsx
│   │   │   ├── rpe-chart.tsx
│   │   │   └── muscle-chart.tsx
│   │   ├── pr/
│   │   │   ├── pr-card.tsx
│   │   │   └── pr-form-dialog.tsx
│   │   └── shared/
│   │       ├── stat-card.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── phase-badge.tsx
│   │       ├── purpose-badge.tsx
│   │       ├── rpe-indicator.tsx
│   │       └── empty-state.tsx
│   ├── db/
│   │   ├── index.ts                  ← conexión Neon + drizzle()
│   │   ├── schema.ts                 ← todas las tablas + relaciones
│   │   └── seed.ts                   ← script de seed (43 ejercicios)
│   ├── lib/
│   │   ├── calculations.ts           ← e1RM, volumen, RPE promedio
│   │   ├── validators.ts             ← Zod schemas para cada entidad
│   │   ├── constants.ts              ← enums, colores de fase, labels
│   │   └── utils.ts                  ← formatters, helpers
│   └── actions/
│       ├── exercises.ts              ← CRUD server actions
│       ├── mesocycles.ts             ← CRUD + training days + prescribed
│       ├── workouts.ts               ← session + sets + PR detection
│       ├── records.ts                ← PR manual + queries
│       └── analytics.ts              ← queries para charts
└── drizzle/
    └── migrations/                   ← generadas por drizzle-kit
```

---

## 4. Convenciones

### TypeScript
- Strict mode habilitado
- Tipos explícitos para props de componentes (no `any`)
- Enums como `as const` objects, no `enum` keyword
- `Decimal` → `number` en TypeScript. Precisión manejada en DB (`numeric(6,1)`)

### Next.js
- **Server Components** por defecto. `"use client"` solo cuando hay interactividad
- **Server Actions** para todas las mutaciones (crear, editar, eliminar)
- **Queries directas a DB** en server components (no endpoints API)
- `revalidatePath()` después de cada mutación
- `redirect()` después de crear/editar exitoso
- Slug de rutas en español: `/ejercicios/`, `/mesociclos/`, `/entrenar/`

### Componentes
- Un archivo = un componente (excepto variants internos)
- Props con interface, no type. Nombre: `{Component}Props`
- Client components: prefijo `"use client"` en primera línea
- Formularios: React Hook Form + Zod resolver. Nunca `useState` para campos

### Drizzle
- Schema en un solo archivo: `src/db/schema.ts`
- Relaciones declaradas con `relations()` helper
- Usar `pgEnum` para campos con choices fijas
- Timestamps con `.$defaultFn(() => new Date())`

### shadcn/ui
- Importar desde `@/components/ui/`
- No modificar archivos generados de shadcn. Crear wrappers en `components/shared/`
- Toast para feedback de acciones (éxito, error)
- Dialog para confirmaciones de eliminación y modales de PR

---

## 5. Arquitectura de Dos Capas

```
CAPA DE PROGRAMA (planificación)          CAPA DE EJECUCIÓN (registro)
─────────────────────────────────         ────────────────────────────────
Mesocycle                                  WorkoutSession
  └─ TrainingDay                             └─ ExerciseLog
       └─ PrescribedExercise                      └─ SetLog
                                                        → PersonalRecord (auto)

Exercise (catálogo compartido)
BodyweightEntry (standalone)
```

**Relación clave:** `WorkoutSession.trainingDayId` → `TrainingDay.id` (FK nullable).
Permite sesiones libres o vinculadas.

---

## 6. Schema de Base de Datos (Drizzle)

### Conexión — `src/db/index.ts`
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Enums — `src/db/schema.ts`
```typescript
import { pgTable, pgEnum, text, integer, numeric, boolean, date, timestamp, serial, unique } from "drizzle-orm/pg-core";

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

export const roleEnum = pgEnum("user_role", [
  "ADMIN", "USER"
]);
```

### Tablas

```typescript
// ─── User ───
export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  name:         text("name"),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role:         roleEnum("role").notNull().default("USER"),
  createdAt:    timestamp("created_at").$defaultFn(() => new Date()),
});

// ─── Exercise ─── (catálogo global, compartido entre usuarios; CRUD solo ADMIN)
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
  userId:       integer("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId:          integer("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId:       integer("user_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId:   integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  date:     date("date").notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 1 }).notNull(),
  notes:    text("notes").default(""),
}, (table) => [
  unique("bodyweight_entries_user_date_unique").on(table.userId, table.date),
]);
```

### Relaciones
```typescript
import { relations } from "drizzle-orm";

export const userRelations = relations(users, ({ many }) => ({
  mesocycles:        many(mesocycles),
  workoutSessions:   many(workoutSessions),
  personalRecords:   many(personalRecords),
  bodyweightEntries: many(bodyweightEntries),
}));

export const mesocycleRelations = relations(mesocycles, ({ one, many }) => ({
  user:         one(users, { fields: [mesocycles.userId], references: [users.id] }),
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
  user:         one(users, { fields: [workoutSessions.userId], references: [users.id] }),
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
  user:     one(users, { fields: [personalRecords.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [personalRecords.exerciseId], references: [exercises.id] }),
  setLog:   one(setLogs, { fields: [personalRecords.setLogId], references: [setLogs.id] }),
}));

export const bodyweightEntryRelations = relations(bodyweightEntries, ({ one }) => ({
  user: one(users, { fields: [bodyweightEntries.userId], references: [users.id] }),
}));
```

---

## 6.1 Arquitectura de Autenticación

```
src/auth.config.ts   ← config edge-safe (sin bcrypt/db): pages, session strategy,
                        callbacks.authorized (usado por middleware), jwt/session callbacks
src/auth.ts           ← NextAuth(authConfig) + provider Credentials (bcrypt.compare contra
                        users.passwordHash). Exporta { handlers, auth, signIn, signOut }
src/middleware.ts      ← NextAuth(authConfig).auth envuelto como middleware; matcher
                        protege todo excepto /login, /api/auth/*, estáticos
src/app/api/auth/[...nextauth]/route.ts  ← export const { GET, POST } = handlers
src/lib/auth-helpers.ts                  ← requireUser() / requireAdmin() / assertOwnership()
```

**Roles:** `ADMIN` ve y edita todos los datos de todos los usuarios. `USER` solo ve/edita
lo propio (filtrado por `userId` en cada query de lectura y cada server action de
mutación). El catálogo de `exercises` es global y compartido; su CRUD queda restringido
a `ADMIN` vía `requireAdmin()`.

**Patrón en server actions de mutación:**
```typescript
export async function algunaAction(...) {
  const user = await requireUser();           // lanza si no hay sesión
  // ... insertar con userId: user.id, o:
  assertOwnership(recurso.userId, user);       // ADMIN pasa siempre; USER solo lo propio
}
```

**Patrón en lecturas (server components):**
```typescript
const user = await requireUser();
const rows = await db.query.workoutSessions.findMany({
  where: user.role === "ADMIN" ? undefined : eq(workoutSessions.userId, user.id),
  ...
});
```

**Seed del admin:** `src/db/seed-user.ts` (idempotente, upsert por email). Ejecutar con
`npm run seed:user`.

---

## 7. Zod Validators — `src/lib/validators.ts`

```typescript
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
  startDate:    z.string().optional(),
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
  exerciseId:   z.coerce.number().int().positive(),
  order:        z.coerce.number().int().min(1).default(1),
  sets:         z.coerce.number().int().min(1).default(3),
  repsMin:      z.coerce.number().int().min(1).default(6),
  repsMax:      z.coerce.number().int().min(1).default(8),
  intensityMin: z.coerce.number().min(0).max(100).optional(),
  intensityMax: z.coerce.number().min(0).max(100).optional(),
  rpeTarget:    z.coerce.number().min(5).max(10).default(8.0),
  restSeconds:  z.coerce.number().int().min(0).default(120),
  purpose:      z.enum(["STRENGTH", "HYPERTROPHY", "STABILIZER", "POWER"]).default("STRENGTH"),
  notes:        z.string().optional().default(""),
  deloadSets:   z.coerce.number().int().min(1).optional(),
  deloadRpe:    z.coerce.number().min(5).max(10).optional(),
});

export const workoutSessionSchema = z.object({
  date:            z.string().min(1),
  trainingDayId:   z.coerce.number().int().positive().optional(),
  title:           z.string().optional().default(""),
  isDeload:        z.boolean().optional().default(false),
  bodyweightKg:    z.coerce.number().positive().optional(),
  perceivedEnergy: z.coerce.number().int().min(1).max(10).optional(),
});

export const setLogSchema = z.object({
  exerciseId:    z.coerce.number().int().positive(),
  weightKg:      z.coerce.number().min(0),
  repsCompleted: z.coerce.number().int().min(0),
  rpe:           z.coerce.number().min(5).max(10).optional(),
  isWarmup:      z.boolean().optional().default(false),
  notes:         z.string().optional().default(""),
});

export const finishSessionSchema = z.object({
  durationMinutes: z.coerce.number().int().min(1).optional(),
  perceivedEnergy: z.coerce.number().int().min(1).max(10).optional(),
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
```

---

## 8. Cálculos — `src/lib/calculations.ts`

```typescript
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
```

---

## 9. Constantes — `src/lib/constants.ts`

```typescript
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
```

---

## 10. Server Actions

Patrón general:

```typescript
"use server";

import { db } from "@/db";
import { exercises } from "@/db/schema";
import { exerciseSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createExercise(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = exerciseSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.insert(exercises).values(parsed.data);
  revalidatePath("/ejercicios");
  redirect("/ejercicios");
}
```

### `addSet` — Lógica crítica de PR

```typescript
// src/actions/workouts.ts — extracto
export async function addSet(sessionId: number, formData: FormData) {
  const parsed = setLogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { exerciseId, weightKg, repsCompleted, rpe, isWarmup, notes } = parsed.data;

  // 1. Get or create ExerciseLog
  let [exerciseLog] = await db.select().from(exerciseLogs)
    .where(and(eq(exerciseLogs.sessionId, sessionId), eq(exerciseLogs.exerciseId, exerciseId)));

  if (!exerciseLog) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(exerciseLogs)
      .where(eq(exerciseLogs.sessionId, sessionId));
    [exerciseLog] = await db.insert(exerciseLogs).values({
      sessionId, exerciseId, order: count + 1,
    }).returning();
  }

  // 2. Next set number
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(set_number), 0)` })
    .from(setLogs).where(eq(setLogs.exerciseLogId, exerciseLog.id));

  // 3. Insert SetLog
  const [newSet] = await db.insert(setLogs).values({
    exerciseLogId: exerciseLog.id, setNumber: max + 1,
    weightKg: String(weightKg), repsCompleted,
    rpe: rpe !== undefined ? String(rpe) : null,
    isWarmup: isWarmup ?? false, notes: notes ?? "",
  }).returning();

  // 4. PR detection
  let isPR = false;
  if (!isWarmup) {
    const e1rm = estimateE1RM(weightKg, repsCompleted, rpe);
    if (e1rm) {
      const [bestPR] = await db.select().from(personalRecords)
        .where(eq(personalRecords.exerciseId, exerciseId))
        .orderBy(desc(personalRecords.estimated1rm)).limit(1);

      if (!bestPR || e1rm > Number(bestPR.estimated1rm)) {
        const [session] = await db.select().from(workoutSessions)
          .where(eq(workoutSessions.id, sessionId));
        await db.insert(personalRecords).values({
          exerciseId, recordType: "E1RM",
          weightKg: String(weightKg), reps: repsCompleted,
          estimated1rm: String(e1rm), date: session.date,
          setLogId: newSet.id, notes: "PR detectado automáticamente",
        });
        isPR = true;
      }
    }
  }

  revalidatePath(`/entrenar/${sessionId}`);
  return { success: true, isPR };
}
```

---

## 11. Componentes Clave

### `set-logger.tsx` (el más complejo)

```
"use client"
- Combobox (shadcn Command) para buscar ejercicio
- Inputs: peso (step 0.5), reps, RPE (step 0.5, min 5, max 10)
- Checkbox warmup
- Preview de e1RM en tiempo real (useWatch de RHF + estimateE1RM)
- Submit via server action → toast éxito, toast especial si PR
- Auto-fill peso/reps del último set del mismo ejercicio
```

### Charts (client, `"use client"`)

Reciben data como prop desde server component padre.

```
e1rm-chart.tsx     → Recharts LineChart
volume-chart.tsx   → Recharts BarChart
rpe-chart.tsx      → Recharts LineChart (domain [5, 10])
muscle-chart.tsx   → Recharts PieChart
```

### Shared

```
stat-card.tsx      → icon (Lucide) + valor + label
phase-badge.tsx    → Badge con color de PHASE_COLORS
purpose-badge.tsx  → Badge con variant por propósito
rpe-indicator.tsx  → span con color de rpeColor()
empty-state.tsx    → Lucide icon + texto + CTA
confirm-dialog.tsx → AlertDialog shadcn con server action
```

---

## 12. Patrón de Form Component

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mesocycleSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

type FormValues = z.infer<typeof mesocycleSchema>;

interface MesocycleFormProps {
  defaultValues?: Partial<FormValues>;
  action: (formData: FormData) => Promise<{ errors?: Record<string, string[]> } | void>;
}

export function MesocycleForm({ defaultValues, action }: MesocycleFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(mesocycleSchema),
    defaultValues: { name: "", phase: "ACCUMULATION", totalWeeks: 4, ...defaultValues },
  });

  async function onSubmit(data: FormValues) {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    const result = await action(fd);
    if (result?.errors) {
      Object.entries(result.errors).forEach(([field, msgs]) =>
        form.setError(field as keyof FormValues, { message: msgs[0] })
      );
    } else {
      toast.success("Guardado");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* FormField por cada campo */}
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}
```

---

## 13. Queries del Dashboard — `src/app/page.tsx`

```typescript
// Server component — queries directas
const activeMeso = await db.query.mesocycles.findFirst({
  where: eq(mesocycles.isActive, true),
  with: { trainingDays: true },
});

const recentSessions = await db.query.workoutSessions.findMany({
  limit: 5,
  orderBy: [desc(workoutSessions.date)],
  with: { exerciseLogs: { with: { exercise: true, sets: true } } },
});

const recentPRs = await db.query.personalRecords.findMany({
  limit: 5,
  orderBy: [desc(personalRecords.date)],
  with: { exercise: true },
});

// Week stats: sesiones y volumen de los últimos 7 días
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
const weekSessions = await db.query.workoutSessions.findMany({
  where: gte(workoutSessions.date, weekAgo),
  with: { exerciseLogs: { with: { sets: true } } },
});

// Volume trend: 8 semanas para Recharts BarChart
```

---

## 14. Fases de Implementación

### FASE 1: Scaffold (secuencial)

**1.1** `npx create-next-app@latest ironlog` con TS + Tailwind + App Router  
**1.2** Instalar deps: drizzle, neon, zod, rhf, recharts  
**1.3** `drizzle.config.ts` → `DATABASE_URL`  
**1.4** `pnpm dlx shadcn@latest init` + instalar 15 componentes  
**1.5** `.env.local` con `DATABASE_URL`  
**1.6** Crear estructura de carpetas (sección 3)

**Verificación:** `pnpm dev` compila

---

### FASE 2: Base de datos (secuencial)

**2.1** `src/db/schema.ts` completo  
**2.2** `src/db/index.ts` conexión  
**2.3** `pnpm drizzle-kit generate`  
**2.4** `pnpm drizzle-kit push`  
**2.5** `src/db/seed.ts` → 43 ejercicios  
**2.6** `pnpm tsx src/db/seed.ts`

**Verificación:** 43 rows en exercises, tablas creadas

---

### FASE 3: Lógica (paralelizable ↓)

#### Subagente 3.A: Lib + Actions
3.A.1 `calculations.ts` · 3.A.2 `validators.ts` · 3.A.3 `constants.ts` · 3.A.4 `utils.ts`  
3.A.5 `actions/exercises.ts` · 3.A.6 `actions/mesocycles.ts`  
3.A.7 `actions/workouts.ts` (con PR detection)  
3.A.8 `actions/records.ts` · 3.A.9 `actions/analytics.ts`

#### Subagente 3.B: Layout + Shared
3.B.1 `layout.tsx` · 3.B.2 `navbar.tsx` · 3.B.3 `page-header.tsx`  
3.B.4–3.B.9 Shared components (stat-card, badges, empty-state, confirm-dialog)

#### Subagente 3.C: Form Components (client)
3.C.1–3.C.2 Exercise form + filters  
3.C.3–3.C.6 Mesocycle forms  
3.C.7–3.C.11 Workout forms (set-logger es el más complejo)  
3.C.12–3.C.13 PR card + dialog

---

### FASE 4: Pages (secuencial)

**4.1** Dashboard `/`  
**4.2** Ejercicios: lista + nuevo + editar  
**4.3** Mesociclos: lista + nuevo + detalle + editar + día/* + ejercicio/*  
**4.4** Entrenar: iniciar + logging + finalizar  
**4.5** Historial: lista + detalle  
**4.6** Analítica: selector + 4 charts Recharts  
**4.7** PRs: board + modal

---

### FASE 5: Charts (paralelo con Fase 4)

5.1 `e1rm-chart.tsx` · 5.2 `volume-chart.tsx`  
5.3 `rpe-chart.tsx` · 5.4 `muscle-chart.tsx`

---

### FASE 6: Integración

**6.1** Flujo: meso → día → prescribir → sesión → sets → PR  
**6.2** e1RM: 100kg × 5 @RPE8 = 123.3kg  
**6.3** Auto-PR funciona  
**6.4** Charts con datos reales  
**6.5** Responsive 375px  
**6.6** `pnpm build` → 0 errores

---

## 15. Catálogo Seed — `src/db/seed.ts`

### Primarios (6)
| Nombre | Músculo | Equipo | Patrón |
|--------|---------|--------|--------|
| Sentadilla trasera | QUADS | BARBELL | SQUAT |
| Press de banca | CHEST | BARBELL | H_PUSH |
| Peso muerto convencional | HAMSTRINGS | BARBELL | HINGE |
| Press militar de pie | SHOULDERS | BARBELL | V_PUSH |
| Sentadilla frontal | QUADS | BARBELL | SQUAT |
| Peso muerto sumo | GLUTES | BARBELL | HINGE |

### Secundarios (12)
| Nombre | Músculo | Equipo | Patrón |
|--------|---------|--------|--------|
| Press inclinado con mancuernas | CHEST | DUMBBELL | H_PUSH |
| Remo con barra | BACK | BARBELL | H_PULL |
| Remo con mancuerna | BACK | DUMBBELL | H_PULL |
| Hip thrust | GLUTES | BARBELL | HINGE |
| Peso muerto rumano | HAMSTRINGS | BARBELL | HINGE |
| Dominadas | BACK | BODYWEIGHT | V_PULL |
| Jalón al pecho | BACK | CABLE | V_PULL |
| Press con mancuernas sentado | SHOULDERS | DUMBBELL | V_PUSH |
| Press de banca inclinado | CHEST | BARBELL | H_PUSH |
| Sentadilla búlgara | QUADS | DUMBBELL | SQUAT |
| Prensa de piernas | QUADS | MACHINE | SQUAT |
| Remo en polea baja | BACK | CABLE | H_PULL |

### Accesorios (15)
| Nombre | Músculo | Equipo | Patrón |
|--------|---------|--------|--------|
| Elevaciones laterales | SHOULDERS | DUMBBELL | ISOLATION |
| Curl con barra | BICEPS | BARBELL | ISOLATION |
| Curl con mancuernas | BICEPS | DUMBBELL | ISOLATION |
| Extensión de tríceps en polea | TRICEPS | CABLE | ISOLATION |
| Press francés | TRICEPS | BARBELL | ISOLATION |
| Face pulls | SHOULDERS | CABLE | H_PULL |
| Curl femoral acostado | HAMSTRINGS | MACHINE | ISOLATION |
| Extensión de cuádriceps | QUADS | MACHINE | ISOLATION |
| Aperturas con mancuernas | CHEST | DUMBBELL | ISOLATION |
| Elevación posterior en polea | SHOULDERS | CABLE | ISOLATION |
| Encogimientos con barra | TRAPS | BARBELL | ISOLATION |
| Elevación de talones de pie | CALVES | MACHINE | ISOLATION |
| Elevación de talones sentado | CALVES | MACHINE | ISOLATION |
| Curl martillo | BICEPS | DUMBBELL | ISOLATION |
| Fondos en paralelas | TRICEPS | BODYWEIGHT | H_PUSH |

### Estabilizadores (10)
| Nombre | Músculo | Equipo | Patrón | Flags |
|--------|---------|--------|--------|-------|
| Rotación externa con mancuerna | SHOULDERS | DUMBBELL | ISOLATION | unilateral |
| Band pull-apart | SHOULDERS | BAND | H_PULL | — |
| Plancha frontal | CORE | BODYWEIGHT | ANTI_MOVEMENT | isometric |
| Plancha lateral | CORE | BODYWEIGHT | ANTI_MOVEMENT | isometric, unilateral |
| Pallof press | CORE | CABLE | ANTI_MOVEMENT | — |
| Dead bug | CORE | BODYWEIGHT | ANTI_MOVEMENT | — |
| Bird dog | CORE | BODYWEIGHT | ANTI_MOVEMENT | — |
| Clamshell | GLUTES | BAND | ISOLATION | unilateral |
| Farmer walk | CORE | DUMBBELL | CARRY | — |
| Abducción de cadera con banda | GLUTES | BAND | ISOLATION | — |

---

## 16. Criterios de Aceptación

```
[ ] pnpm build → 0 errores
[ ] drizzle-kit push → tablas en NeonDB
[ ] seed → 43 ejercicios
[ ] GET / → Dashboard con meso activo
[ ] GET /ejercicios → 43 ejercicios, filtros funcionan
[ ] GET /mesociclos → lista
[ ] CRUD mesociclo + día + prescrito → redirect correcto
[ ] Crear sesión → redirect a /entrenar/[id]
[ ] Agregar serie (100kg × 5 @RPE8) → e1RM = 123.3kg
[ ] Auto-PR al superar mejor e1RM
[ ] Toast en éxito, toast especial en PR
[ ] Volumen = Σ(peso × reps) sin warmup
[ ] 4 charts Recharts con datos reales
[ ] Responsive 375px
[ ] Zod: errores visibles por campo
[ ] revalidatePath en cada mutación
[ ] npm run test → unit + integración en verde
[ ] Acceso sin sesión a cualquier ruta (salvo /login) → redirect a /login
[ ] Login con credenciales del admin seed → entra al dashboard
[ ] USER solo ve/edita sus propios mesociclos, sesiones, PRs y peso corporal
[ ] ADMIN ve y edita datos de todos los usuarios
[ ] CRUD de /ejercicios restringido a ADMIN
```
