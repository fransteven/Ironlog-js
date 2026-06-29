"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MUSCLE_LABELS } from "@/lib/constants";

interface MuscleChartProps {
  data: {
    name: string;
    sets: number;
  }[];
}

const COLORS = [
  "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#F59E0B", 
  "#6B7280", "#EC4899", "#14B8A6", "#F43F5E", "#84CC16", 
  "#06B6D4", "#A855F7", "#64748B"
];

export function MuscleChart({ data }: MuscleChartProps) {
  // Traducir las claves de los grupos musculares
  const translatedData = data.map((item) => ({
    name: MUSCLE_LABELS[item.name as keyof typeof MUSCLE_LABELS] || item.name,
    sets: item.sets,
  })).sort((a, b) => b.sets - a.sets);

  if (data.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center text-center p-6 bg-card text-muted-foreground border">
        <p className="text-sm">Registra entrenamientos para ver la distribución del estímulo muscular.</p>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Distribución Muscular (Series)</CardTitle>
        <CardDescription className="text-xs">Número de series de trabajo acumuladas por grupo muscular</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-4 flex flex-col justify-between">
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={translatedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="sets"
            >
              {translatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-md text-xs">
                      <span className="font-bold">{item.name}</span>: {item.value} series
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              layout="horizontal" 
              align="center" 
              verticalAlign="bottom"
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
