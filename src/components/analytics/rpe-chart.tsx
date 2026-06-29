"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RpeChartProps {
  data: {
    date: string;
    avgRpe: number;
  }[];
  exerciseName: string;
}

export function RpeChart({ data, exerciseName }: RpeChartProps) {
  if (data.length === 0) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center text-center p-6 bg-card text-muted-foreground border">
        <p className="text-sm">Registra RPE en tus series de {exerciseName} para ver la progresión de esfuerzo.</p>
      </Card>
    );
  }

  return (
    <Card className="border bg-card shadow-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">RPE Promedio por Sesión</CardTitle>
        <CardDescription className="text-xs">Nivel de esfuerzo autoregulado percibido en {exerciseName}</CardDescription>
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
            <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[5, 10]} ticks={[5, 6, 7, 8, 9, 10]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg p-2.5 shadow-md text-xs space-y-0.5">
                      <p className="font-bold text-slate-800">{item.date}</p>
                      <p className="text-primary font-semibold">RPE Promedio: @ {item.avgRpe}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="avgRpe" 
              stroke="#D97706" // Color ámbar
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
