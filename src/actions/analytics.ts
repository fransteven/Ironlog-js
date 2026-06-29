"use server";

import { db } from "@/db";
import { workoutSessions, exerciseLogs, setLogs, exercises, personalRecords } from "@/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { estimateE1RM } from "@/lib/calculations";

export async function getE1rmTrend(exerciseId: number) {
  try {
    // Obtener todas las series del ejercicio que no sean de calentamiento, junto con la fecha de la sesión
    const result = await db.select({
      date: workoutSessions.date,
      weightKg: setLogs.weightKg,
      repsCompleted: setLogs.repsCompleted,
      rpe: setLogs.rpe,
    })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
    .where(
      and(
        eq(exerciseLogs.exerciseId, exerciseId),
        eq(setLogs.isWarmup, false)
      )
    )
    .orderBy(workoutSessions.date);

    // Agrupar por fecha y calcular el e1RM máximo para cada sesión
    const dailyMax: Record<string, number> = {};
    for (const row of result) {
      const e1rm = estimateE1RM(Number(row.weightKg), row.repsCompleted, row.rpe ? Number(row.rpe) : undefined);
      if (e1rm) {
        if (!dailyMax[row.date] || e1rm > dailyMax[row.date]) {
          dailyMax[row.date] = e1rm;
        }
      }
    }

    return Object.entries(dailyMax).map(([date, value]) => ({
      date,
      e1rm: value,
    }));
  } catch (error) {
    console.error("Error fetching e1RM trend:", error);
    return [];
  }
}

export async function getRpeTrend(exerciseId: number) {
  try {
    const result = await db.select({
      date: workoutSessions.date,
      rpe: setLogs.rpe,
    })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
    .where(
      and(
        eq(exerciseLogs.exerciseId, exerciseId),
        eq(setLogs.isWarmup, false),
        sql`${setLogs.rpe} IS NOT NULL`
      )
    )
    .orderBy(workoutSessions.date);

    // Calcular el RPE promedio por fecha
    const dailyRpes: Record<string, { sum: number; count: number }> = {};
    for (const row of result) {
      const rpeVal = Number(row.rpe);
      if (!dailyRpes[row.date]) {
        dailyRpes[row.date] = { sum: 0, count: 0 };
      }
      dailyRpes[row.date].sum += rpeVal;
      dailyRpes[row.date].count += 1;
    }

    return Object.entries(dailyRpes).map(([date, data]) => ({
      date,
      avgRpe: Math.round((data.sum / data.count) * 10) / 10,
    }));
  } catch (error) {
    console.error("Error fetching RPE trend:", error);
    return [];
  }
}

export async function getVolumeTrend(weeks: number = 8) {
  try {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - weeks * 7);
    const dateLimitStr = dateLimit.toISOString().split("T")[0];

    // Obtener todas las series completadas desde la fecha límite
    const result = await db.select({
      sessionId: workoutSessions.id,
      sessionDate: workoutSessions.date,
      sessionTitle: workoutSessions.title,
      weightKg: setLogs.weightKg,
      repsCompleted: setLogs.repsCompleted,
      isWarmup: setLogs.isWarmup,
    })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(workoutSessions, eq(exerciseLogs.sessionId, workoutSessions.id))
    .where(
      and(
        gte(workoutSessions.date, dateLimitStr),
        eq(setLogs.isWarmup, false)
      )
    )
    .orderBy(workoutSessions.date);

    // Agrupar y sumar el volumen por sesión
    const sessionVolumeMap: Record<number, { date: string; title: string; volume: number }> = {};
    for (const row of result) {
      const vol = Number(row.weightKg) * row.repsCompleted;
      if (!sessionVolumeMap[row.sessionId]) {
        sessionVolumeMap[row.sessionId] = {
          date: row.sessionDate,
          title: row.sessionTitle || "Sesión",
          volume: 0,
        };
      }
      sessionVolumeMap[row.sessionId].volume += vol;
    }

    return Object.values(sessionVolumeMap)
      .map(s => ({
        date: s.date,
        title: s.title,
        volume: Math.round(s.volume * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching volume trend:", error);
    return [];
  }
}

export async function getMuscleGroupDistribution() {
  try {
    const result = await db.select({
      primaryMuscle: exercises.primaryMuscle,
      weightKg: setLogs.weightKg,
      repsCompleted: setLogs.repsCompleted,
    })
    .from(setLogs)
    .innerJoin(exerciseLogs, eq(setLogs.exerciseLogId, exerciseLogs.id))
    .innerJoin(exercises, eq(exerciseLogs.exerciseId, exercises.id))
    .where(eq(setLogs.isWarmup, false));

    const muscleSetsMap: Record<string, number> = {};
    for (const row of result) {
      const muscle = row.primaryMuscle;
      muscleSetsMap[muscle] = (muscleSetsMap[muscle] || 0) + 1;
    }

    return Object.entries(muscleSetsMap).map(([muscle, sets]) => ({
      name: muscle,
      sets,
    }));
  } catch (error) {
    console.error("Error fetching muscle group distribution:", error);
    return [];
  }
}
