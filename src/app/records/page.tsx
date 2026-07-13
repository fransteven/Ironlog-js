import { db } from "@/db";
import { personalRecords, exercises } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { PRCard } from "@/components/pr/pr-card";
import { PRFormDialog } from "@/components/pr/pr-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Award } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";

export const revalidate = 0;

export default async function RecordsPage() {
  const user = await requireUser();

  // 1. Consultar récords personales (ADMIN ve todos; USER solo los propios)
  const prsList = await db.query.personalRecords.findMany({
    where: user.role === "ADMIN" ? undefined : eq(personalRecords.userId, user.id),
    orderBy: [desc(personalRecords.date), desc(personalRecords.createdAt)],
    with: {
      exercise: true,
    },
  });

  // 2. Consultar lista de ejercicios para el diálogo de creación
  const exerciseList = await db.select({
    id: exercises.id,
    name: exercises.name,
    primaryMuscle: exercises.primaryMuscle,
  }).from(exercises);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Récords Personales (PRs)"
        description="Lleva un registro de tus levantamientos máximos reales (1RM) o estimados (e1RM). El sistema detecta récords automáticamente al entrenar."
      >
        <PRFormDialog exercises={exerciseList} />
      </PageHeader>

      {prsList.length === 0 ? (
        <EmptyState
          title="No hay récords registrados"
          description="Usa el botón de arriba para agregar un récord manual o registra entrenamientos intensos para que se detecten automáticamente."
          icon={Award}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          {prsList.map((pr) => (
            <PRCard key={pr.id} pr={pr as any} />
          ))}
        </div>
      )}
    </div>
  );
}
