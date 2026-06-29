import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deletePersonalRecord } from "@/actions/records";
import { toast } from "sonner";

interface PRCardProps {
  pr: {
    id: number;
    recordType: string;
    weightKg: string;
    reps: number;
    estimated1rm: string | null;
    date: string;
    notes: string | null;
    exercise: {
      name: string;
      primaryMuscle: string;
    };
  };
}

export function PRCard({ pr }: PRCardProps) {
  async function handleDelete() {
    try {
      await deletePersonalRecord(pr.id);
      toast.success("Récord eliminado");
      return { success: true };
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar el récord");
      return { error: "Error" };
    }
  }

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-sm bg-card border">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
              {pr.exercise.name}
            </span>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0.2">
              {pr.exercise.primaryMuscle}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{pr.date}</span>
            {pr.notes && (
              <span className="ml-2 pl-2 border-l border-muted-foreground/30 italic text-[11px]">
                "{pr.notes}"
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-foreground">{pr.weightKg} kg</span>
            <span className="text-xs text-muted-foreground">× {pr.reps} {pr.reps === 1 ? "rep" : "reps"}</span>
            {pr.estimated1rm && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200/55 rounded-full px-2 py-0.5 ml-2 font-bold inline-flex items-center gap-1">
                <Award className="h-3 w-3 fill-amber-100" />
                e1RM: {pr.estimated1rm} kg
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pr.recordType === "E1RM" ? (
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-wider">
              AUTO
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              MANUAL
            </Badge>
          )}

          <ConfirmDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            }
            title="¿Eliminar récord?"
            description={`¿Estás seguro de que quieres eliminar este récord de ${pr.exercise.name} (${pr.weightKg}kg × ${pr.reps})?`}
            confirmText="Eliminar"
            onConfirm={handleDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
