import { describe, expect, it } from "vitest";
import {
  calculateMonthlySeries,
  calculateWeeklySeries,
  completeWeeklySeries,
} from "@/backend/domain/analytics/series";

const inspections = [
  { date: "2026-01-01", percentage: 0.8, actions: 0 },
  { date: "2026-01-02", percentage: null, actions: 1 },
  { date: "2026-01-08", percentage: 0.6, actions: null },
];

describe("NP-0036 analytic series", () => {
  it("groups monthly evaluated scores without changing the denominator", () => {
    expect(calculateMonthlySeries(inspections)).toEqual([
      { period: "2026-01", inspections: 2, compliance: 70 },
    ]);
  });

  it("groups weekly volume, score and below-70 cases by ISO Monday", () => {
    expect(calculateWeeklySeries(inspections)).toEqual([
      { inicio: "2025-12-29", inspecciones: 2, promedio: 80, bajo70: 0 },
      { inicio: "2026-01-05", inspecciones: 1, promedio: 60, bajo70: 1 },
    ]);
  });

  it("fills only the missing weeks between observed endpoints", () => {
    const observed = calculateWeeklySeries([
      { date: "2026-01-01", percentage: 0.8, actions: null },
      { date: "2026-01-15", percentage: 0.6, actions: null },
    ]);
    expect(completeWeeklySeries(observed)).toEqual([
      observed[0],
      { inicio: "2026-01-05", inspecciones: 0, promedio: null, bajo70: 0 },
      observed[1],
    ]);
  });
});
