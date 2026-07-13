import { describe, it, expect } from "vitest";
import { estimateE1RM, setVolume, currentWeek } from "@/lib/calculations";

describe("estimateE1RM", () => {
  it("calcula e1RM con Epley + ajuste RIR (criterio AGENTS §16: 100kg x 5 @RPE8 = 123.3kg)", () => {
    expect(estimateE1RM(100, 5, 8)).toBe(123.3);
  });

  it("una sola rep a RPE10 (fallo) devuelve el peso levantado tal cual", () => {
    expect(estimateE1RM(150, 1, 10)).toBe(150);
  });

  it("devuelve null con peso o reps inválidos", () => {
    expect(estimateE1RM(0, 5, 8)).toBeNull();
    expect(estimateE1RM(100, 0, 8)).toBeNull();
  });
});

describe("setVolume", () => {
  it("peso x reps para series efectivas", () => {
    expect(setVolume(100, 5, false)).toBe(500);
  });

  it("0 para series de calentamiento", () => {
    expect(setVolume(100, 5, true)).toBe(0);
  });
});

describe("currentWeek", () => {
  it("null sin fecha de inicio", () => {
    expect(currentWeek(null, 4)).toBeNull();
  });

  it("semana 1 el día de inicio", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(currentWeek(today, 4)).toBe(1);
  });

  it("null si ya pasó el total de semanas del mesociclo", () => {
    const longAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    expect(currentWeek(longAgo, 4)).toBeNull();
  });
});
