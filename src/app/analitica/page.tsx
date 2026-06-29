import { db } from "@/db";
import { exercises } from "@/db/schema";
import { PageHeader } from "@/components/layout/page-header";
import { ExerciseSelector } from "@/components/analytics/exercise-selector";
import { E1rmChart } from "@/components/analytics/e1rm-chart";
import { RpeChart } from "@/components/analytics/rpe-chart";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { MuscleChart } from "@/components/analytics/muscle-chart";
import { getE1rmTrend, getRpeTrend, getVolumeTrend, getMuscleGroupDistribution } from "@/actions/analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, BarChart2, Dumbbell } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    exerciseId?: string;
  }>;
}

export const revalidate = 0;

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. Consultar todos los ejercicios para el selector
  const exerciseList = await db.select({
    id: exercises.id,
    name: exercises.name,
    primaryMuscle: exercises.primaryMuscle,
  }).from(exercises);

  // 2. Determinar ejercicio seleccionado (por defecto el primero de la lista si hay)
  let selectedId = params.exerciseId ? Number(params.exerciseId) : null;
  if (!selectedId && exerciseList.length > 0) {
    // Buscar un ejercicio primario por defecto o el primero disponible
    selectedId = exerciseList[0].id;
  }

  const selectedExercise = exerciseList.find((ex) => ex.id === selectedId);

  // 3. Consultar datos para los gráficos del ejercicio seleccionado
  const e1rmData = selectedId ? await getE1rmTrend(selectedId) : [];
  const rpeData = selectedId ? await getRpeTrend(selectedId) : [];

  // 4. Consultar datos para gráficos globales
  const volumeData = await getVolumeTrend(8); // Últimas 8 semanas
  const muscleData = await getMuscleGroupDistribution();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analíticas y Progresión"
        description="Analiza la evolución de tu fuerza máxima estimada (e1RM), las RPE promedio, la acumulación de volumen y la distribución de series."
      />

      <Tabs defaultValue="exercise" className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md">
          <TabsTrigger value="exercise" className="flex items-center gap-1.5 font-semibold text-xs">
            <Dumbbell className="h-4 w-4" />
            <span>Por Ejercicio</span>
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-1.5 font-semibold text-xs">
            <BarChart2 className="h-4 w-4" />
            <span>Rendimiento Global</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Progresión por Ejercicio */}
        <TabsContent value="exercise" className="space-y-6 animate-in fade-in duration-200">
          <ExerciseSelector 
            exercises={exerciseList} 
            selectedId={selectedId} 
          />

          {selectedExercise ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <E1rmChart 
                data={e1rmData} 
                exerciseName={selectedExercise.name} 
              />
              <RpeChart 
                data={rpeData} 
                exerciseName={selectedExercise.name} 
              />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm border rounded-lg bg-card">
              No hay ejercicios disponibles para analizar. Agrega ejercicios primero.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Rendimiento Global */}
        <TabsContent value="global" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <VolumeChart data={volumeData} />
          <MuscleChart data={muscleData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
