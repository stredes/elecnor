import { describe, expect, it } from "vitest";
import type { ElecnorWorker } from "@/backend/domain/elecnor-contract";
import { calculatePeopleSample, calculatePeopleSampleFromComparison } from "@/backend/domain/reporting/calculate-people-sample";

describe("calculatePeopleSample", () => {
  it("groups repeated names and classifies each person's average result", () => {
    expect(calculatePeopleSample([
      { technician: " Ana Pérez ", percentage: 0.97, actions: 0 },
      { technician: "ana pérez", percentage: 0.94, actions: 0 },
      { technician: "Luis Soto", percentage: 0.9, actions: 0 },
      { technician: "luis soto", percentage: 0.9, actions: 0 },
      { technician: "Marta Díaz", percentage: 0.8, actions: 0 },
      { technician: "Rosa Silva", percentage: 0.79, actions: 0 },
      { technician: null, percentage: 0.99, actions: 0 },
      { technician: "Sin puntaje", percentage: null, actions: null },
    ])).toEqual({
      total: 4,
      bands: [
        { level: 5, label: "Nivel 5 · Buen estado", people: 1, percentage: 25 },
        { level: 4, label: "Nivel 4 · Aceptable", people: 1, percentage: 25 },
        { level: 3, label: "Nivel 3 · Mejorable", people: 1, percentage: 25 },
        { level: 2, label: "Nivel 2 · Deficiente", people: 1, percentage: 25 },
      ],
    });
  });

  it("uses the comparison roster as the person universe", () => {
    expect(calculatePeopleSampleFromComparison([
      comparisonWorker("Ana Pérez", [96, 94]),
      comparisonWorker("Luis Soto", [96]),
      comparisonWorker("Marta Díaz", [80]),
      comparisonWorker("Rosa Silva", [79]),
      comparisonWorker("Sin inspección", []),
    ])).toMatchObject({
      total: 4,
      bands: [
        { level: 5, people: 1, percentage: 25 },
        { level: 4, people: 1, percentage: 25 },
        { level: 3, people: 1, percentage: 25 },
        { level: 2, people: 1, percentage: 25 },
      ],
    });
  });

  it("filters reporting scores by comparison names instead of counting outside technicians", () => {
    const sample = calculatePeopleSampleFromComparison(
      [comparisonWorker("Ana Pérez", [])],
      [
        { id: "inside", technician: "Ana Pérez", percentage: 0.96, actions: 0 },
        { id: "outside", technician: "Técnico fuera de nómina", percentage: 1, actions: 0 },
      ],
    );
    expect(sample.total).toBe(1);
    expect(sample.bands[0]).toMatchObject({ level: 5, people: 1, percentage: 100 });
  });

  it("returns an empty sample when no named inspection has a valid result", () => {
    expect(calculatePeopleSample([
      { technician: null, percentage: 0.9, actions: 0 },
      { technician: "Ana", percentage: null, actions: null },
    ])).toEqual({
      total: 0,
      bands: [
        { level: 5, label: "Nivel 5 · Buen estado", people: 0, percentage: 0 },
        { level: 4, label: "Nivel 4 · Aceptable", people: 0, percentage: 0 },
        { level: 3, label: "Nivel 3 · Mejorable", people: 0, percentage: 0 },
        { level: 2, label: "Nivel 2 · Deficiente", people: 0, percentage: 0 },
      ],
    });
  });
});

function comparisonWorker(name: string, percentages: readonly number[]): ElecnorWorker {
  return {
    name,
    inspections: percentages.map((percentage, index) => ({ audit_id: `${name}-${index}`, percentage })),
  } as unknown as ElecnorWorker;
}
