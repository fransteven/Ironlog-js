"use server";

import { db } from "@/db";
import { exercises } from "@/db/schema";
import { exerciseSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function createExercise(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    category: formData.get("category"),
    primaryMuscle: formData.get("primaryMuscle"),
    secondaryMuscles: formData.get("secondaryMuscles") || "",
    equipment: formData.get("equipment"),
    movementPattern: formData.get("movementPattern"),
    description: formData.get("description") || "",
    isUnilateral: formData.get("isUnilateral") === "true",
    isIsometric: formData.get("isIsometric") === "true",
  };

  const parsed = exerciseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.insert(exercises).values(parsed.data);
  } catch (error) {
    console.error("Error creating exercise:", error);
    return { errors: { name: ["Error al guardar el ejercicio en la base de datos."] } };
  }

  revalidatePath("/ejercicios");
  redirect("/ejercicios");
}

export async function updateExercise(id: number, formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name"),
    category: formData.get("category"),
    primaryMuscle: formData.get("primaryMuscle"),
    secondaryMuscles: formData.get("secondaryMuscles") || "",
    equipment: formData.get("equipment"),
    movementPattern: formData.get("movementPattern"),
    description: formData.get("description") || "",
    isUnilateral: formData.get("isUnilateral") === "true",
    isIsometric: formData.get("isIsometric") === "true",
  };

  const parsed = exerciseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.update(exercises).set(parsed.data).where(eq(exercises.id, id));
  } catch (error) {
    console.error("Error updating exercise:", error);
    return { errors: { name: ["Error al actualizar el ejercicio."] } };
  }

  revalidatePath("/ejercicios");
  redirect("/ejercicios");
}

export async function deleteExercise(id: number) {
  await requireAdmin();

  try {
    await db.delete(exercises).where(eq(exercises.id, id));
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return { error: "No se pudo eliminar el ejercicio." };
  }

  revalidatePath("/ejercicios");
  redirect("/ejercicios");
}
