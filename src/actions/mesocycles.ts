"use server";

import { db } from "@/db";
import { mesocycles, trainingDays, prescribedExercises } from "@/db/schema";
import { mesocycleSchema, trainingDaySchema, prescribedExerciseSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, not, and } from "drizzle-orm";

// --- Mesocycle Actions ---

export async function createMesocycle(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    phase: formData.get("phase"),
    totalWeeks: formData.get("totalWeeks"),
    deloadWeek: formData.get("deloadWeek"),
    startDate: formData.get("startDate") || null,
    description: formData.get("description") || "",
    strengthPct: formData.get("strengthPct") || 65,
    isActive: formData.get("isActive") !== "false", // default true
    order: formData.get("order") || 1,
  };

  const parsed = mesocycleSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    // Si este mesociclo se marca como activo, desactivar todos los demás
    if (parsed.data.isActive) {
      await db.update(mesocycles).set({ isActive: false });
    }

    await db.insert(mesocycles).values(parsed.data);
  } catch (error) {
    console.error("Error creating mesocycle:", error);
    return { errors: { name: ["Error al crear el mesociclo."] } };
  }

  revalidatePath("/mesociclos");
  redirect("/mesociclos");
}

export async function updateMesocycle(id: number, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    phase: formData.get("phase"),
    totalWeeks: formData.get("totalWeeks"),
    deloadWeek: formData.get("deloadWeek"),
    startDate: formData.get("startDate") || null,
    description: formData.get("description") || "",
    strengthPct: formData.get("strengthPct") || 65,
    isActive: formData.get("isActive") === "true",
    order: formData.get("order") || 1,
  };

  const parsed = mesocycleSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    // Si se activa, desactivar los demás
    if (parsed.data.isActive) {
      await db.update(mesocycles).set({ isActive: false }).where(not(eq(mesocycles.id, id)));
    }

    await db.update(mesocycles).set(parsed.data).where(eq(mesocycles.id, id));
  } catch (error) {
    console.error("Error updating mesocycle:", error);
    return { errors: { name: ["Error al actualizar el mesociclo."] } };
  }

  revalidatePath("/mesociclos");
  revalidatePath(`/mesociclos/${id}`);
  redirect(`/mesociclos/${id}`);
}

export async function toggleMesocycleActive(id: number, isActive: boolean) {
  try {
    if (isActive) {
      // Desactivar todos los demás primero
      await db.update(mesocycles).set({ isActive: false });
    }
    await db.update(mesocycles).set({ isActive }).where(eq(mesocycles.id, id));
  } catch (error) {
    console.error("Error toggling mesocycle active state:", error);
    return { error: "No se pudo cambiar el estado activo." };
  }

  revalidatePath("/mesociclos");
  revalidatePath(`/mesociclos/${id}`);
  revalidatePath("/");
}

export async function deleteMesocycle(id: number) {
  try {
    await db.delete(mesocycles).where(eq(mesocycles.id, id));
  } catch (error) {
    console.error("Error deleting mesocycle:", error);
    return { error: "No se pudo eliminar el mesociclo." };
  }

  revalidatePath("/mesociclos");
  redirect("/mesociclos");
}

// --- TrainingDay Actions ---

export async function createTrainingDay(mesocycleId: number, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    dayNumber: formData.get("dayNumber"),
    focus: formData.get("focus") || "",
  };

  const parsed = trainingDaySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.insert(trainingDays).values({
      mesocycleId,
      ...parsed.data,
    });
  } catch (error) {
    console.error("Error creating training day:", error);
    return { errors: { name: ["Error al crear el día de entrenamiento."] } };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}

export async function updateTrainingDay(id: number, mesocycleId: number, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    dayNumber: formData.get("dayNumber"),
    focus: formData.get("focus") || "",
  };

  const parsed = trainingDaySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.update(trainingDays).set(parsed.data).where(eq(trainingDays.id, id));
  } catch (error) {
    console.error("Error updating training day:", error);
    return { errors: { name: ["Error al actualizar el día de entrenamiento."] } };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}

export async function deleteTrainingDay(id: number, mesocycleId: number) {
  try {
    await db.delete(trainingDays).where(eq(trainingDays.id, id));
  } catch (error) {
    console.error("Error deleting training day:", error);
    return { error: "No se pudo eliminar el día de entrenamiento." };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}

// --- PrescribedExercise Actions ---

export async function createPrescribedExercise(trainingDayId: number, mesocycleId: number, formData: FormData) {
  const raw = {
    exerciseId: formData.get("exerciseId"),
    order: formData.get("order") || 1,
    sets: formData.get("sets"),
    repsMin: formData.get("repsMin"),
    repsMax: formData.get("repsMax"),
    intensityMin: formData.get("intensityMin") || null,
    intensityMax: formData.get("intensityMax") || null,
    rpeTarget: formData.get("rpeTarget") || 8.0,
    restSeconds: formData.get("restSeconds") || 120,
    purpose: formData.get("purpose") || "STRENGTH",
    notes: formData.get("notes") || "",
    deloadSets: formData.get("deloadSets") || null,
    deloadRpe: formData.get("deloadRpe") || null,
  };

  const parsed = prescribedExerciseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.insert(prescribedExercises).values({
      trainingDayId,
      exerciseId: parsed.data.exerciseId,
      order: parsed.data.order,
      sets: parsed.data.sets,
      repsMin: parsed.data.repsMin,
      repsMax: parsed.data.repsMax,
      intensityMin: parsed.data.intensityMin ? String(parsed.data.intensityMin) : null,
      intensityMax: parsed.data.intensityMax ? String(parsed.data.intensityMax) : null,
      rpeTarget: String(parsed.data.rpeTarget),
      restSeconds: parsed.data.restSeconds,
      purpose: parsed.data.purpose,
      notes: parsed.data.notes,
      deloadSets: parsed.data.deloadSets,
      deloadRpe: parsed.data.deloadRpe ? String(parsed.data.deloadRpe) : null,
    });
  } catch (error) {
    console.error("Error creating prescribed exercise:", error);
    return { errors: { exerciseId: ["Error al prescribir el ejercicio."] } };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}

export async function updatePrescribedExercise(id: number, trainingDayId: number, mesocycleId: number, formData: FormData) {
  const raw = {
    exerciseId: formData.get("exerciseId"),
    order: formData.get("order") || 1,
    sets: formData.get("sets"),
    repsMin: formData.get("repsMin"),
    repsMax: formData.get("repsMax"),
    intensityMin: formData.get("intensityMin") || null,
    intensityMax: formData.get("intensityMax") || null,
    rpeTarget: formData.get("rpeTarget") || 8.0,
    restSeconds: formData.get("restSeconds") || 120,
    purpose: formData.get("purpose") || "STRENGTH",
    notes: formData.get("notes") || "",
    deloadSets: formData.get("deloadSets") || null,
    deloadRpe: formData.get("deloadRpe") || null,
  };

  const parsed = prescribedExerciseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.update(prescribedExercises).set({
      exerciseId: parsed.data.exerciseId,
      order: parsed.data.order,
      sets: parsed.data.sets,
      repsMin: parsed.data.repsMin,
      repsMax: parsed.data.repsMax,
      intensityMin: parsed.data.intensityMin ? String(parsed.data.intensityMin) : null,
      intensityMax: parsed.data.intensityMax ? String(parsed.data.intensityMax) : null,
      rpeTarget: String(parsed.data.rpeTarget),
      restSeconds: parsed.data.restSeconds,
      purpose: parsed.data.purpose,
      notes: parsed.data.notes,
      deloadSets: parsed.data.deloadSets,
      deloadRpe: parsed.data.deloadRpe ? String(parsed.data.deloadRpe) : null,
    }).where(eq(prescribedExercises.id, id));
  } catch (error) {
    console.error("Error updating prescribed exercise:", error);
    return { errors: { exerciseId: ["Error al actualizar el ejercicio prescrito."] } };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}

export async function deletePrescribedExercise(id: number, mesocycleId: number) {
  try {
    await db.delete(prescribedExercises).where(eq(prescribedExercises.id, id));
  } catch (error) {
    console.error("Error deleting prescribed exercise:", error);
    return { error: "No se pudo eliminar el ejercicio prescrito." };
  }

  revalidatePath(`/mesociclos/${mesocycleId}`);
  redirect(`/mesociclos/${mesocycleId}`);
}
