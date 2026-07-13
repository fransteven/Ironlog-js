"use server";

import { db } from "@/db";
import { workoutSessions, exerciseLogs, setLogs, personalRecords, exercises, trainingDays, prescribedExercises } from "@/db/schema";
import { setLogSchema, finishSessionSchema, workoutSessionSchema } from "@/lib/validators";
import { estimateE1RM } from "@/lib/calculations";
import { requireUser, assertOwnership } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, desc, asc, sql } from "drizzle-orm";

export async function startWorkoutSession(trainingDayId?: number | null) {
  const user = await requireUser();
  let title = "Sesión Libre";
  let isDeload = false;

  if (trainingDayId) {
    const day = await db.query.trainingDays.findFirst({
      where: eq(trainingDays.id, trainingDayId),
      with: {
        mesocycle: true,
      }
    });
    if (day) {
      title = `${day.mesocycle.name} - ${day.name}`;
      isDeload = day.mesocycle.phase === "GENERAL"; // O si está configurado
    }
  }

  let session;
  try {
    [session] = await db.insert(workoutSessions).values({
      userId: user.id,
      date: new Date().toISOString().split("T")[0],
      trainingDayId: trainingDayId || null,
      title,
      isDeload,
      notes: "",
    }).returning();

    // Si está vinculada a un día prescrito, pre-crear los exerciseLogs para conveniencia
    if (trainingDayId) {
      const orderedPrescribed = await db.query.prescribedExercises.findMany({
        where: eq(prescribedExercises.trainingDayId, trainingDayId),
        orderBy: [asc(prescribedExercises.order)],
      });

      for (let i = 0; i < orderedPrescribed.length; i++) {
        await db.insert(exerciseLogs).values({
          sessionId: session.id,
          exerciseId: orderedPrescribed[i].exerciseId,
          order: i + 1,
          notes: "",
        });
      }
    }
  } catch (error) {
    console.error("Error starting workout session:", error);
    throw new Error("No se pudo iniciar la sesión de entrenamiento.");
  }

  revalidatePath("/");
  revalidatePath("/historial");
  redirect(`/entrenar/${session.id}`);
}

export async function addSet(sessionId: number, formData: FormData) {
  const user = await requireUser();

  const raw = {
    exerciseId: formData.get("exerciseId"),
    weightKg: formData.get("weightKg"),
    repsCompleted: formData.get("repsCompleted"),
    rpe: formData.get("rpe") ? formData.get("rpe") : null,
    isWarmup: formData.get("isWarmup") === "true",
    notes: formData.get("notes") || "",
  };

  const parsed = setLogSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { exerciseId, weightKg, repsCompleted, rpe, isWarmup, notes } = parsed.data;

  const [ownerSession] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, sessionId));
  if (!ownerSession) {
    return { errors: { exerciseId: ["Sesión no encontrada."] } };
  }
  assertOwnership(ownerSession.userId, user);

  // 1. Obtener o crear el ExerciseLog para esta sesión y ejercicio
  let [exerciseLog] = await db.select().from(exerciseLogs)
    .where(and(eq(exerciseLogs.sessionId, sessionId), eq(exerciseLogs.exerciseId, exerciseId)));

  if (!exerciseLog) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(exerciseLogs)
      .where(eq(exerciseLogs.sessionId, sessionId));
    [exerciseLog] = await db.insert(exerciseLogs).values({
      sessionId,
      exerciseId,
      order: count + 1,
    }).returning();
  }

  // 2. Número de la siguiente serie
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(set_number), 0)` })
    .from(setLogs).where(eq(setLogs.exerciseLogId, exerciseLog.id));

  // 3. Insertar SetLog
  const [newSet] = await db.insert(setLogs).values({
    exerciseLogId: exerciseLog.id,
    setNumber: max + 1,
    weightKg: String(weightKg),
    repsCompleted,
    rpe: rpe !== undefined && rpe !== null ? String(rpe) : null,
    isWarmup: isWarmup ?? false,
    notes: notes ?? "",
  }).returning();

  // 4. Detección automática de PR (Personal Record)
  // Nota: la serie ya quedó insertada arriba. Este bloque no debe hacer fallar
  // addSet completo si algo aquí revienta (neon-http no soporta rollback),
  // así que se aísla en su propio try/catch.
  let isPR = false;
  try {
    if (!isWarmup && repsCompleted > 0) {
      const e1rm = estimateE1RM(weightKg, repsCompleted, rpe || undefined);
      if (e1rm) {
        // Buscar el mejor PR estimado de 1RM existente de ESTE usuario para este ejercicio
        const [bestPR] = await db.select().from(personalRecords)
          .where(and(eq(personalRecords.exerciseId, exerciseId), eq(personalRecords.userId, user.id)))
          .orderBy(desc(personalRecords.estimated1rm)).limit(1);

        if (!bestPR || e1rm > Number(bestPR.estimated1rm)) {
          const [session] = await db.select().from(workoutSessions)
            .where(eq(workoutSessions.id, sessionId));

          await db.insert(personalRecords).values({
            userId: user.id,
            exerciseId,
            recordType: "E1RM",
            weightKg: String(weightKg),
            reps: repsCompleted,
            estimated1rm: String(e1rm),
            date: session.date,
            setLogId: newSet.id,
            notes: "PR detectado automáticamente",
          });
          isPR = true;
        }
      }
    }
  } catch (error) {
    console.error("Error detecting PR (set already saved):", error);
  }

  revalidatePath(`/entrenar/${sessionId}`);
  return { success: true, isPR };
}

export async function deleteSet(setId: number, sessionId: number) {
  const user = await requireUser();

  try {
    const [session] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, sessionId));
    if (!session) return { error: "Sesión no encontrada" };
    assertOwnership(session.userId, user);

    // 1. Buscar la serie para saber a qué log pertenece y qué número de serie es
    const [setToDelete] = await db.select().from(setLogs).where(eq(setLogs.id, setId));
    if (!setToDelete) return { error: "Serie no encontrada" };

    // 2. Eliminar PRs vinculados a esta serie
    await db.delete(personalRecords).where(eq(personalRecords.setLogId, setId));

    // 3. Eliminar la serie
    await db.delete(setLogs).where(eq(setLogs.id, setId));

    // 4. Reordenar las series restantes para este ejercicio
    const remainingSets = await db.select().from(setLogs)
      .where(eq(setLogs.exerciseLogId, setToDelete.exerciseLogId))
      .orderBy(setLogs.setNumber);

    for (let i = 0; i < remainingSets.length; i++) {
      await db.update(setLogs).set({ setNumber: i + 1 }).where(eq(setLogs.id, remainingSets[i].id));
    }
  } catch (error) {
    console.error("Error deleting set:", error);
    return { error: "No se pudo eliminar la serie." };
  }

  revalidatePath(`/entrenar/${sessionId}`);
  return { success: true };
}

export async function finishWorkoutSession(id: number, formData: FormData) {
  const user = await requireUser();

  const raw = {
    durationMinutes: formData.get("durationMinutes"),
    perceivedEnergy: formData.get("perceivedEnergy"),
    notes: formData.get("notes") || "",
  };

  const parsed = finishSessionSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const [existing] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id));
    if (!existing) return { errors: { notes: ["Sesión no encontrada."] } };
    assertOwnership(existing.userId, user);

    await db.update(workoutSessions).set({
      durationMinutes: parsed.data.durationMinutes,
      perceivedEnergy: parsed.data.perceivedEnergy,
      notes: parsed.data.notes,
    }).where(eq(workoutSessions.id, id));

    // Limpiar exerciseLogs vacíos (p.ej. pre-creados desde un día prescrito
    // pero nunca registrados) para que /historial no muestre ejercicios
    // "fantasma" sin series.
    const logs = await db.select().from(exerciseLogs).where(eq(exerciseLogs.sessionId, id));
    for (const log of logs) {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(setLogs).where(eq(setLogs.exerciseLogId, log.id));
      if (Number(count) === 0) {
        await db.delete(exerciseLogs).where(eq(exerciseLogs.id, log.id));
      }
    }
  } catch (error) {
    console.error("Error finishing workout session:", error);
    return { errors: { notes: ["Error al finalizar la sesión."] } };
  }

  revalidatePath(`/entrenar/${id}`);
  revalidatePath("/");
  revalidatePath("/historial");
  redirect("/historial");
}

export async function deleteWorkoutSession(id: number) {
  const user = await requireUser();

  try {
    const [existing] = await db.select().from(workoutSessions).where(eq(workoutSessions.id, id));
    if (!existing) return { error: "Sesión no encontrada." };
    assertOwnership(existing.userId, user);

    // Buscar exerciseLogs de la sesión para borrar PRs asociados
    const logs = await db.select().from(exerciseLogs).where(eq(exerciseLogs.sessionId, id));
    for (const log of logs) {
      const sets = await db.select().from(setLogs).where(eq(setLogs.exerciseLogId, log.id));
      for (const set of sets) {
        await db.delete(personalRecords).where(eq(personalRecords.setLogId, set.id));
      }
    }

    await db.delete(workoutSessions).where(eq(workoutSessions.id, id));
  } catch (error) {
    console.error("Error deleting workout session:", error);
    return { error: "No se pudo eliminar la sesión de entrenamiento." };
  }

  revalidatePath("/historial");
  revalidatePath("/");
  redirect("/historial");
}
