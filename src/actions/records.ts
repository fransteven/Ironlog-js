"use server";

import { db } from "@/db";
import { personalRecords, bodyweightEntries } from "@/db/schema";
import { personalRecordSchema } from "@/lib/validators";
import { estimateE1RM } from "@/lib/calculations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function createPersonalRecord(formData: FormData) {
  const raw = {
    exerciseId: formData.get("exerciseId"),
    recordType: formData.get("recordType"),
    weightKg: formData.get("weightKg"),
    reps: formData.get("reps") || 1,
    date: formData.get("date"),
    notes: formData.get("notes") || "",
  };

  const parsed = personalRecordSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { exerciseId, recordType, weightKg, reps, date, notes } = parsed.data;

  // Calcular e1RM si es necesario
  let estimated1rm = String(weightKg);
  if (recordType === "E1RM") {
    const calculated = estimateE1RM(weightKg, reps, 10); // Asume RPE 10 para estimaciones manuales si no se especifica
    if (calculated) estimated1rm = String(calculated);
  }

  try {
    await db.insert(personalRecords).values({
      exerciseId,
      recordType,
      weightKg: String(weightKg),
      reps,
      estimated1rm,
      date,
      notes,
    });
  } catch (error) {
    console.error("Error creating personal record:", error);
    return { errors: { notes: ["Error al guardar el récord personal."] } };
  }

  revalidatePath("/records");
  revalidatePath("/");
  redirect("/records");
}

export async function deletePersonalRecord(id: number) {
  try {
    await db.delete(personalRecords).where(eq(personalRecords.id, id));
  } catch (error) {
    console.error("Error deleting personal record:", error);
    return { error: "No se pudo eliminar el récord." };
  }

  revalidatePath("/records");
  revalidatePath("/");
}

// --- Bodyweight Actions (Upsert por fecha) ---

const bodyweightFormSchema = z.object({
  date: z.string().min(1, "La fecha es requerida"),
  weightKg: z.coerce.number().positive("El peso debe ser un número positivo"),
  notes: z.string().optional().default(""),
});

export async function upsertBodyweightEntry(formData: FormData) {
  const raw = {
    date: formData.get("date"),
    weightKg: formData.get("weightKg"),
    notes: formData.get("notes") || "",
  };

  const parsed = bodyweightFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { date, weightKg, notes } = parsed.data;

  try {
    await db.insert(bodyweightEntries)
      .values({
        date,
        weightKg: String(weightKg),
        notes,
      })
      .onConflictDoUpdate({
        target: bodyweightEntries.date,
        set: {
          weightKg: String(weightKg),
          notes,
        },
      });
  } catch (error) {
    console.error("Error upserting bodyweight entry:", error);
    return { errors: { notes: ["Error al registrar el peso corporal."] } };
  }

  revalidatePath("/records"); // O en analítica/dashboard
  revalidatePath("/");
  return { success: true };
}

export async function deleteBodyweightEntry(id: number) {
  try {
    await db.delete(bodyweightEntries).where(eq(bodyweightEntries.id, id));
  } catch (error) {
    console.error("Error deleting bodyweight entry:", error);
    return { error: "No se pudo eliminar el registro." };
  }

  revalidatePath("/records");
  revalidatePath("/");
}
