import { PageHeader } from "@/components/layout/page-header";
import { MesocycleForm } from "@/components/mesocycles/mesocycle-form";
import { createMesocycle } from "@/actions/mesocycles";

export default function NewMesocyclePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo Mesociclo"
        description="Configura los parámetros clave de tu bloque de entrenamiento, como fase, semanas totales e intensidad promedio objetivo."
      />
      <div className="flex justify-start">
        <MesocycleForm action={createMesocycle} />
      </div>
    </div>
  );
}
