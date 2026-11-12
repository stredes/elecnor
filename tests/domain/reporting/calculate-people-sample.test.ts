import { describe, expect, it } from "vitest";
import { calculatePeopleSample } from "@/backend/domain/reporting/calculate-people-sample";

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

  it("consolidates spelling, order, accents and duplicated extracted name fragments", () => {
    const sample = calculatePeopleSample([
      { technician: "Ana Pérez", percentage: 0.96, actions: 0 },
      { technician: "PEREZ, ANA", percentage: 0.94, actions: 0 },
      { technician: "Marcos BravoMarcos Bravo Fuentes", percentage: 0.82, actions: 0 },
      { technician: "Marcos Bravo Fuentes", percentage: 0.86, actions: 0 },
      { technician: "Rosa Silva", percentage: 0.90, actions: 0 },
      { technician: "Rosa Soto", percentage: 0.90, actions: 0 },
      { technician: "Sin nombre", percentage: 1, actions: 0 },
    ]);

    expect(sample.total).toBe(4);
    expect(sample.bands.find((band) => band.level === 4)?.people).toBe(3);
    expect(sample.bands.find((band) => band.level === 3)?.people).toBe(1);
  });

  it("accepts reporting percentages in either decimal or whole-percent scale", () => {
    const sample = calculatePeopleSample([
      { technician: "Ana Pérez", percentage: 96, actions: 0 },
      { technician: "Luis Soto", percentage: 0.94, actions: 0 },
    ]);

    expect(sample.total).toBe(2);
    expect(sample.bands.find((band) => band.level === 5)?.people).toBe(1);
    expect(sample.bands.find((band) => band.level === 4)?.people).toBe(1);
  });
});
