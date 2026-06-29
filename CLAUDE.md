# CLAUDE.md — IronLog (Next.js)

## Fuente de la verdad
@AGENTS.md

## Comandos Útiles

- **Ejecutar Servidor de Desarrollo**: `npm run dev`
- **Compilar Proyecto**: `npm run build`
- **Iniciar Producción**: `npm run start`
- **Generar Migraciones Drizzle**: `npx drizzle-kit generate`
- **Sincronizar Esquemas Drizzle (Push)**: `npx --package dotenv-cli dotenv -e .env.local -- npx drizzle-kit push`
- **Poblar Base de Datos (Seed)**: `npx --package dotenv-cli dotenv -e .env.local -- npx tsx src/db/seed.ts`

## Guías de Estilo y Diseño

- **Arquitectura**: Next.js 15+ App Router con Server Components por defecto. Uso de Server Actions para mutaciones (crear, editar, eliminar).
- **Base de Datos**: NeonDB (PostgreSQL Serverless) mediante Drizzle ORM. Conexión configurada en `src/db/index.ts`.
- **Validación**: Schemas de validación definidos en `src/lib/validators.ts` con Zod. Formularios gestionados mediante React Hook Form con Zod resolver.
- **UI & Estilo**: TailwindCSS + shadcn/ui. Colores temáticos dinámicos por RPE y fases de periodización importados de `src/lib/constants.ts`.
- **Notificaciones**: Feedback de acciones al usuario usando `sonner` (`toast.success` / `toast.error`).
- **Nombres**: URLs y rutas en español (`/ejercicios`, `/mesociclos`, `/entrenar`). Código, tablas y campos de base de datos en inglés (`exercises`, `mesocycles`, `weightKg`).
