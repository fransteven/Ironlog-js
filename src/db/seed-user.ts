import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import { users } from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL no está definida en las variables de entorno");
  process.exit(1);
}

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL / ADMIN_PASSWORD no están definidas en las variables de entorno");
  process.exit(1);
}
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD;

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const [existing] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));

  if (existing) {
    await db.update(users)
      .set({ passwordHash, role: "ADMIN" })
      .where(eq(users.email, ADMIN_EMAIL));
    console.log(`✓ Usuario admin actualizado: ${ADMIN_EMAIL}`);
  } else {
    await db.insert(users).values({
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      name: "Admin",
    });
    console.log(`✓ Usuario admin creado: ${ADMIN_EMAIL}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error creando el usuario admin:", error);
    process.exit(1);
  });
