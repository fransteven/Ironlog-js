import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware edge-safe: usa solo authConfig (sin provider Credentials, sin
// bcrypt), así puede correr en el Edge Runtime.
const { auth } = NextAuth(authConfig);

export function middleware(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  // Protege todo excepto /login, las rutas internas de NextAuth, y estáticos.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
