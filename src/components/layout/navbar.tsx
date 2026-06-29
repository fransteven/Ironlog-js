"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Calendar, BarChart2, Award, History, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart2 },
    { href: "/entrenar", label: "Entrenar", icon: Play },
    { href: "/mesociclos", label: "Mesociclos", icon: Calendar },
    { href: "/ejercicios", label: "Ejercicios", icon: Dumbbell },
    { href: "/historial", label: "Historial", icon: History },
    { href: "/records", label: "Récords PR", icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Dumbbell className="h-6 w-6 text-primary animate-pulse" />
            <span>IronLog</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary border-b-2 border-primary py-1" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Nav Button & Sheet could be here, or we can use mobile bar at bottom for best mobile experience! */}
        <div className="flex items-center gap-4">
          <Link
            href="/entrenar"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Entrenar</span>
          </Link>
        </div>
      </div>

      {/* Bottom Nav for Mobile Screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full h-16 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
