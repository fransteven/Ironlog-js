import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, exercises, workoutSessions, exerciseLogs, personalRecords } from "@/db/schema";

// Estas actions usan revalidatePath/redirect, que requieren un request-scope
// de Next.js (lanzan "Invariant: ... store missing" fuera de él). Se mockean
// para poder ejercitar la lógica de negocio real (addSet, finishWorkoutSession)
// en un test de integración contra la BD real de .env.local.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

let TEST_USER_ID: number;
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: String(TEST_USER_ID), role: "ADMIN" } })),
}));

const { addSet, finishWorkoutSession } = await import("@/actions/workouts");

describe("historial: flujo real de registro (addSet → /historial)", () => {
  let testExerciseId: number;
  let testSessionId: number;
  let emptyExerciseLogId: number;

  beforeAll(async () => {
    const [user] = await db.insert(users).values({
      email: `test-historial-${Date.now()}@ironlog.test`,
      passwordHash: "unused-in-this-test",
      role: "USER",
      name: "Test Historial",
    }).returning();
    TEST_USER_ID = user.id;

    const [exercise] = await db.insert(exercises).values({
      name: `TEST__Sentadilla ${Date.now()}`,
      category: "PRIMARY",
      primaryMuscle: "QUADS",
      equipment: "BARBELL",
      movementPattern: "SQUAT",
    }).returning();
    testExerciseId = exercise.id;

    const [session] = await db.insert(workoutSessions).values({
      userId: TEST_USER_ID,
      title: "TEST__Sesion Historial",
    }).returning();
    testSessionId = session.id;
  });

  afterAll(async () => {
    // cascade limpia exerciseLogs/setLogs/personalRecords de la sesión y del ejercicio
    await db.delete(workoutSessions).where(eq(workoutSessions.id, testSessionId));
    await db.delete(exercises).where(eq(exercises.id, testExerciseId));
    await db.delete(users).where(eq(users.id, TEST_USER_ID));
  });

  it("registra una serie efectiva y detecta PR (100kg × 5 @RPE8 → e1RM 123.3kg, criterio AGENTS §16)", async () => {
    const fd = new FormData();
    fd.append("exerciseId", String(testExerciseId));
    fd.append("weightKg", "100");
    fd.append("repsCompleted", "5");
    fd.append("rpe", "8");
    fd.append("isWarmup", "false");

    const result = await addSet(testSessionId, fd);
    expect(result.success).toBe(true);
    expect(result.isPR).toBe(true);

    const [pr] = await db.select().from(personalRecords).where(eq(personalRecords.exerciseId, testExerciseId));
    expect(pr).toBeDefined();
    expect(Number(pr.estimated1rm)).toBeCloseTo(123.3, 1);
  });

  it("registra una serie de calentamiento sin generar PR", async () => {
    const fd = new FormData();
    fd.append("exerciseId", String(testExerciseId));
    fd.append("weightKg", "40");
    fd.append("repsCompleted", "10");
    fd.append("isWarmup", "true");

    const result = await addSet(testSessionId, fd);
    expect(result.success).toBe(true);
    expect(result.isPR).toBeFalsy();
  });

  it("deja un exerciseLog vacío (sin sets) para verificar el fix de limpieza al finalizar", async () => {
    const [log] = await db.insert(exerciseLogs).values({
      sessionId: testSessionId,
      exerciseId: testExerciseId,
      order: 99,
    }).returning();
    emptyExerciseLogId = log.id;

    const before = await db.select().from(exerciseLogs).where(eq(exerciseLogs.id, emptyExerciseLogId));
    expect(before).toHaveLength(1);
  });

  it("la sesión aparece con series/volumen correctos en la query exacta de /historial", async () => {
    const session = await db.query.workoutSessions.findFirst({
      where: eq(workoutSessions.id, testSessionId),
      with: { exerciseLogs: { with: { sets: true } } },
    });

    expect(session).toBeDefined();
    const totalSets = session!.exerciseLogs.reduce((acc, log) => acc + log.sets.length, 0);
    const workingSets = session!.exerciseLogs.reduce(
      (acc, log) => acc + log.sets.filter((s) => !s.isWarmup).length, 0
    );
    const volume = session!.exerciseLogs.reduce((acc, log) => {
      return acc + log.sets.reduce((a, s) => a + (s.isWarmup ? 0 : Number(s.weightKg) * s.repsCompleted), 0);
    }, 0);

    expect(totalSets).toBe(2); // 1 efectiva + 1 warmup
    expect(workingSets).toBe(1);
    expect(volume).toBe(500); // 100kg × 5 reps, warmup excluido
  });

  it("finishWorkoutSession limpia exerciseLogs vacíos (fix #3) y guarda metadata", async () => {
    const fd = new FormData();
    fd.append("durationMinutes", "45");
    fd.append("perceivedEnergy", "7");

    await expect(finishWorkoutSession(testSessionId, fd)).rejects.toThrow(/NEXT_REDIRECT/);

    const remainingEmptyLog = await db.select().from(exerciseLogs).where(eq(exerciseLogs.id, emptyExerciseLogId));
    expect(remainingEmptyLog).toHaveLength(0);

    const [updated] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, testSessionId));
    expect(updated.durationMinutes).toBe(45);
    expect(updated.perceivedEnergy).toBe(7);
  });
});
