"use client";

import { useTransition } from "react";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

interface UserMenuProps {
  user: { email?: string | null; role?: "ADMIN" | "USER" };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground px-2">
        {user.role === "ADMIN" ? (
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        ) : (
          <UserIcon className="h-3.5 w-3.5" />
        )}
        <span className="font-medium truncate max-w-[160px]">{user.email}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={isPending}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
