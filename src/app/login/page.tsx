import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Dumbbell } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-[9px] bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-[0_2px_12px_rgba(59,130,246,0.35)]">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">IronLog</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
