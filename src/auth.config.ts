import type { NextAuthConfig } from "next-auth";

/**
 * Config edge-safe (sin bcrypt, sin acceso a DB salvo lo necesario en el
 * provider). El middleware importa SOLO este archivo para poder correr en
 * el Edge Runtime. Los providers reales (Credentials, que sí usa bcrypt y
 * `db`) se añaden en `src/auth.ts`, que es Node-only.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // se completan en src/auth.ts
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = request.nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        // Ya logueado intentando ver /login → mandarlo al dashboard
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      // Cualquier otra ruta requiere sesión
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
