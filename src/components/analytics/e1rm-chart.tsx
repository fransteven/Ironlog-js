"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface E1rmChartProps {
  data: {
    date: string;
    e1rm: number;
  }[];
  exerciseName: string;
}

export function E1rmChart({ data, exerciseName }: E1rmChartProps) {
  if (data.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center text-center p-6 bg-card text-muted-foreground border">
        <p className="text-sm">Registra más series efectivas para este ejercicio para ver tu progresión de e1RM.</p>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Progresión de 1RM Estimado (e1RM)</CardTitle>
        <CardDescription className="text-xs">Evolución de la fuerza máxima estimada en {exerciseName}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis 
              dataKey="date" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(str) => {
                const parts = str.split("-");
                return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : str;
              }}
            />
            <YAxis fontSize={10} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-2.5 shadow-md text-xs space-y-0.5">
                      <p className="font-bold text-slate-800">{item.date}</p>
                      <p className="text-primary font-semibold">e1RM: {item.e1rm} kg</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="e1rm" 
              stroke="#EA580C" // Color naranja de fuerza
              strokeWidth={2.5}
              activeDot={{ r: 6 }} 
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
