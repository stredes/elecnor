import { describe, expect, it } from "vitest";
import { classifyExigencyPercentage, exigencyLevelLabel, exigencyStateClass } from "@/backend/domain/reporting/exigency-scale";

describe("exigency scale", () => {
  it.each([
    [79.99, 2, "Nivel 2 · Deficiente"],
    [80, 3, "Nivel 3 · Mejorable"],
    [89.99, 3, "Nivel 3 · Mejorable"],
    [90, 4, "Nivel 4 · Aceptable"],
    [95, 4, "Nivel 4 · Aceptable"],
    [95.01, 5, "Nivel 5 · Buen estado"],
  ])("classifies %s at level %s", (score, level, label) => {
    expect(classifyExigencyPercentage(score)).toBe(level);
    expect(exigencyLevelLabel(score)).toBe(label);
    expect(exigencyStateClass(score)).toBe(`is-level-${level}`);
  });
});
