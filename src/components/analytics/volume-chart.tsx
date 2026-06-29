"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VolumeChartProps {
  data: {
    date: string;
    title: string;
    volume: number;
  }[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center text-center p-6 bg-card text-muted-foreground border">
        <p className="text-sm">No hay suficientes datos de volumen para mostrar el gráfico.</p>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Volumen Total por Sesión</CardTitle>
        <CardDescription className="text-xs">Tonelaje total movilizado (peso × repeticiones) en series de trabajo</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-md text-xs space-y-1">
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-muted-foreground">{item.date}</p>
                      <p className="text-primary font-semibold">Volumen: {item.volume} kg</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="volume" fill="var(--color-primary, #3B82F6)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
