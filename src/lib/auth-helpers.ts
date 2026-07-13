import { auth } from "@/auth";

export interface CurrentUser {
  id: number;
  role: "ADMIN" | "USER";
}

/** Sesión actual o lanza si no hay usuario autenticado. Uso en server actions/queries. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autenticado.");
  }
  return { id: Number(session.user.id), role: session.user.role };
}

/** ADMIN ve/edita todo; USER solo lo propio. Lanza si un USER intenta tocar datos ajenos. */
export function assertOwnership(resourceUserId: number | null, user: CurrentUser) {
  if (user.role === "ADMIN") return;
  if (resourceUserId !== user.id) {
    throw new Error("No tienes permiso sobre este recurso.");
  }
}

/** Catálogo de ejercicios: compartido/global, gestionado solo por ADMIN. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Se requiere rol de administrador.");
  }
  return user;
}
