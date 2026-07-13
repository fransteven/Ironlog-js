"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, Play, Clock, MoreHorizontal, Dumbbell, Award, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

interface NavbarProps {
  user?: { email?: string | null; role?: "ADMIN" | "USER" } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const desktopLinks = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/mesociclos", label: "Programa", icon: Calendar },
    { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
    { href: "/historial", label: "Historial", icon: Clock },
    { href: "/analitica", label: "Analítica", icon: BarChart2 },
    { href: "/records", label: "Récords", icon: Award },
  ];

  const mobileItems = [
    { href: "/", label: "Inicio", icon: LayoutGrid },
    { href: "/mesociclos", label: "Programa", icon: Calendar },
    null, // FAB placeholder
    { href: "/historial", label: "Historial", icon: Clock },
    { href: "/records", label: "Más", icon: MoreHorizontal },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-[0_2px_12px_rgba(59,130,246,0.35)]">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground tracking-tight">IronLog</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          {desktopLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA + Theme toggle */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/entrenar"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_2px_12px_rgba(59,130,246,0.35)]"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Entrenar</span>
          </Link>
          {user && <UserMenu user={user} />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around px-4">
        {mobileItems.map((item, i) => {
          if (!item) {
            return (
              <Link
                key="fab"
                href="/entrenar"
                className="flex flex-col items-center -mt-6"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.4)] border-4 border-background">
                  <Play className="h-5 w-5 fill-white text-white" />
                </div>
                <span className="text-[9px] font-semibold text-foreground mt-0.5">Entrenar</span>
              </Link>
            );
          }
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-1 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
              <span>{item.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
