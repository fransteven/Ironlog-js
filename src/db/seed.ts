import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { exercises } from "./schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL no está definida en las variables de entorno");
  process.exit(1);
}

const sql = neon(databaseUrl);
const db = drizzle(sql, { schema });

const exerciseData: (typeof exercises.$inferInsert)[] = [
  // --- Primarios (6) ---
  {
    name: "Sentadilla trasera",
    category: "PRIMARY",
    primaryMuscle: "QUADS",
    equipment: "BARBELL",
    movementPattern: "SQUAT",
    description: "Sentadilla libre trasera clásica con barra",
  },
  {
    name: "Press de banca",
    category: "PRIMARY",
    primaryMuscle: "CHEST",
    equipment: "BARBELL",
    movementPattern: "H_PUSH",
    description: "Press de banca plano con barra",
  },
  {
    name: "Peso muerto convencional",
    category: "PRIMARY",
    primaryMuscle: "HAMSTRINGS",
    equipment: "BARBELL",
    movementPattern: "HINGE",
    description: "Peso muerto convencional con barra desde el suelo",
  },
  {
    name: "Press militar de pie",
    category: "PRIMARY",
    primaryMuscle: "SHOULDERS",
    equipment: "BARBELL",
    movementPattern: "V_PUSH",
    description: "Press militar de hombros de pie con barra",
  },
  {
    name: "Sentadilla frontal",
    category: "PRIMARY",
    primaryMuscle: "QUADS",
    equipment: "BARBELL",
    movementPattern: "SQUAT",
    description: "Sentadilla frontal con barra apoyada en deltoides",
  },
  {
    name: "Peso muerto sumo",
    category: "PRIMARY",
    primaryMuscle: "GLUTES",
    equipment: "BARBELL",
    movementPattern: "HINGE",
    description: "Peso muerto con postura sumo ancha con barra",
  },

  // --- Secundarios (12) ---
  {
    name: "Press inclinado con mancuernas",
    category: "SECONDARY",
    primaryMuscle: "CHEST",
    equipment: "DUMBBELL",
    movementPattern: "H_PUSH",
    description: "Press de banca inclinado con mancuernas",
  },
  {
    name: "Remo con barra",
    category: "SECONDARY",
    primaryMuscle: "BACK",
    equipment: "BARBELL",
    movementPattern: "H_PULL",
    description: "Remo inclinado con barra",
  },
  {
    name: "Remo con mancuerna",
    category: "SECONDARY",
    primaryMuscle: "BACK",
    equipment: "DUMBBELL",
    movementPattern: "H_PULL",
    description: "Remo unilateral apoyado con mancuerna",
    isUnilateral: true,
  },
  {
    name: "Hip thrust",
    category: "SECONDARY",
    primaryMuscle: "GLUTES",
    equipment: "BARBELL",
    movementPattern: "HINGE",
    description: "Empuje de cadera con barra apoyada en banco",
  },
  {
    name: "Peso muerto rumano",
    category: "SECONDARY",
    primaryMuscle: "HAMSTRINGS",
    equipment: "BARBELL",
    movementPattern: "HINGE",
    description: "Peso muerto rumano con barra para énfasis en femoral/glúteo",
  },
  {
    name: "Dominadas",
    category: "SECONDARY",
    primaryMuscle: "BACK",
    equipment: "BODYWEIGHT",
    movementPattern: "V_PULL",
    description: "Dominadas en barra fija con agarre prono o supino",
  },
  {
    name: "Jalón al pecho",
    category: "SECONDARY",
    primaryMuscle: "BACK",
    equipment: "CABLE",
    movementPattern: "V_PULL",
    description: "Jalón al pecho en polea alta",
  },
  {
    name: "Press con mancuernas sentado",
    category: "SECONDARY",
    primaryMuscle: "SHOULDERS",
    equipment: "DUMBBELL",
    movementPattern: "V_PUSH",
    description: "Press de hombros sentado con mancuernas",
  },
  {
    name: "Press de banca inclinado",
    category: "SECONDARY",
    primaryMuscle: "CHEST",
    equipment: "BARBELL",
    movementPattern: "H_PUSH",
    description: "Press de banca inclinado con barra",
  },
  {
    name: "Sentadilla búlgara",
    category: "SECONDARY",
    primaryMuscle: "QUADS",
    equipment: "DUMBBELL",
    movementPattern: "SQUAT",
    description: "Sentadilla búlgara unilateral con pie trasero elevado",
    isUnilateral: true,
  },
  {
    name: "Prensa de piernas",
    category: "SECONDARY",
    primaryMuscle: "QUADS",
    equipment: "MACHINE",
    movementPattern: "SQUAT",
    description: "Prensa de piernas inclinada en máquina",
  },
  {
    name: "Remo en polea baja",
    category: "SECONDARY",
    primaryMuscle: "BACK",
    equipment: "CABLE",
    movementPattern: "H_PULL",
    description: "Remo sentado en polea baja con agarre estrecho o ancho",
  },

  // --- Accesorios (15) ---
  {
    name: "Elevaciones laterales",
    category: "ACCESSORY",
    primaryMuscle: "SHOULDERS",
    equipment: "DUMBBELL",
    movementPattern: "ISOLATION",
    description: "Elevación lateral de mancuernas para deltoides lateral",
  },
  {
    name: "Curl con barra",
    category: "ACCESSORY",
    primaryMuscle: "BICEPS",
    equipment: "BARBELL",
    movementPattern: "ISOLATION",
    description: "Curl de bíceps clásico con barra recta o barra Z",
  },
  {
    name: "Curl con mancuernas",
    category: "ACCESSORY",
    primaryMuscle: "BICEPS",
    equipment: "DUMBBELL",
    movementPattern: "ISOLATION",
    description: "Curl de bíceps alterno con mancuernas",
  },
  {
    name: "Extensión de tríceps en polea",
    category: "ACCESSORY",
    primaryMuscle: "TRICEPS",
    equipment: "CABLE",
    movementPattern: "ISOLATION",
    description: "Extensión de tríceps en polea alta con cuerda o barra",
  },
  {
    name: "Press francés",
    category: "ACCESSORY",
    primaryMuscle: "TRICEPS",
    equipment: "BARBELL",
    movementPattern: "ISOLATION",
    description: "Extensión de tríceps acostado con barra Z",
  },
  {
    name: "Face pulls",
    category: "ACCESSORY",
    primaryMuscle: "SHOULDERS",
    equipment: "CABLE",
    movementPattern: "H_PULL",
    description: "Jalón a la cara en polea alta para deltoides posterior y rotadores",
  },
  {
    name: "Curl femoral acostado",
    category: "ACCESSORY",
    primaryMuscle: "HAMSTRINGS",
    equipment: "MACHINE",
    movementPattern: "ISOLATION",
    description: "Curl de piernas acostado en máquina femoral",
  },
  {
    name: "Extensión de cuádriceps",
    category: "ACCESSORY",
    primaryMuscle: "QUADS",
    equipment: "MACHINE",
    movementPattern: "ISOLATION",
    description: "Extensión de piernas sentado en máquina de cuádriceps",
  },
  {
    name: "Aperturas con mancuernas",
    category: "ACCESSORY",
    primaryMuscle: "CHEST",
    equipment: "DUMBBELL",
    movementPattern: "ISOLATION",
    description: "Aperturas o flyes de pecho acostado con mancuernas",
  },
  {
    name: "Elevación posterior en polea",
    category: "ACCESSORY",
    primaryMuscle: "SHOULDERS",
    equipment: "CABLE",
    movementPattern: "ISOLATION",
    description: "Cruce de poleas invertido o elevación posterior para deltoides posterior",
  },
  {
    name: "Encogimientos con barra",
    category: "ACCESSORY",
    primaryMuscle: "TRAPS",
    equipment: "BARBELL",
    movementPattern: "ISOLATION",
    description: "Encogimientos de hombros con barra para trapecio superior",
  },
  {
    name: "Elevación de talones de pie",
    category: "ACCESSORY",
    primaryMuscle: "CALVES",
    equipment: "MACHINE",
    movementPattern: "ISOLATION",
    description: "Elevación de talones en máquina de pie o multipower",
  },
  {
    name: "Elevación de talones sentado",
    category: "ACCESSORY",
    primaryMuscle: "CALVES",
    equipment: "MACHINE",
    movementPattern: "ISOLATION",
    description: "Elevación de talones en máquina sentado",
  },
  {
    name: "Curl martillo",
    category: "ACCESSORY",
    primaryMuscle: "BICEPS",
    equipment: "DUMBBELL",
    movementPattern: "ISOLATION",
    description: "Curl de bíceps martillo con agarre neutro",
  },
  {
    name: "Fondos en paralelas",
    category: "ACCESSORY",
    primaryMuscle: "TRICEPS",
    equipment: "BODYWEIGHT",
    movementPattern: "H_PUSH",
    description: "Fondos en barras paralelas para tríceps y pecho inferior",
  },

  // --- Estabilizadores (10) ---
  {
    name: "Rotación externa con mancuerna",
    category: "STABILIZER",
    primaryMuscle: "SHOULDERS",
    equipment: "DUMBBELL",
    movementPattern: "ISOLATION",
    description: "Rotación externa del manguito rotador apoyado con mancuerna",
    isUnilateral: true,
  },
  {
    name: "Band pull-apart",
    category: "STABILIZER",
    primaryMuscle: "SHOULDERS",
    equipment: "BAND",
    movementPattern: "H_PULL",
    description: "Aperturas horizontales con banda elástica",
  },
  {
    name: "Plancha frontal",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "BODYWEIGHT",
    movementPattern: "ANTI_MOVEMENT",
    description: "Plancha abdominal isométrica boca abajo",
    isIsometric: true,
  },
  {
    name: "Plancha lateral",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "BODYWEIGHT",
    movementPattern: "ANTI_MOVEMENT",
    description: "Plancha lateral isométrica unilateral",
    isIsometric: true,
    isUnilateral: true,
  },
  {
    name: "Pallof press",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "CABLE",
    movementPattern: "ANTI_MOVEMENT",
    description: "Prensa Pallof en polea para anti-rotación de core",
  },
  {
    name: "Dead bug",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "BODYWEIGHT",
    movementPattern: "ANTI_MOVEMENT",
    description: "Ejercicio de estabilidad de core boca arriba alternando extremidades",
  },
  {
    name: "Bird dog",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "BODYWEIGHT",
    movementPattern: "ANTI_MOVEMENT",
    description: "Ejercicio de estabilidad en cuadrupedia alternando brazo y pierna contraria",
  },
  {
    name: "Clamshell",
    category: "STABILIZER",
    primaryMuscle: "GLUTES",
    equipment: "BAND",
    movementPattern: "ISOLATION",
    description: "Rotación externa de cadera acostado de lado con banda (almeja)",
    isUnilateral: true,
  },
  {
    name: "Farmer walk",
    category: "STABILIZER",
    primaryMuscle: "CORE",
    equipment: "DUMBBELL",
    movementPattern: "CARRY",
    description: "Paseo del granjero cargando mancuernas pesadas",
  },
  {
    name: "Abducción de cadera con banda",
    category: "STABILIZER",
    primaryMuscle: "GLUTES",
    equipment: "BAND",
    movementPattern: "ISOLATION",
    description: "Aperturas laterales de cadera de pie o sentado con banda elástica",
  },
];

async function seed() {
  console.log("Iniciando seed de ejercicios...");
  try {
    // Primero, limpiar ejercicios existentes para evitar duplicados
    await db.delete(exercises);
    console.log("Tabla de ejercicios vaciada.");

    // Insertar los 43 ejercicios
    await db.insert(exercises).values(exerciseData);
    console.log("¡Seed completado con éxito! 43 ejercicios insertados.");
  } catch (error) {
    console.error("Error al sembrar la base de datos:", error);
    process.exit(1);
  }
}

seed();
