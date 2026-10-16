import { describe, expect, it } from "vitest";
import {
  calculateMonthlySeries,
  calculateWeeklySeries,
} from "@/backend/domain/analytics/series";

describe("NP-0036 date boundaries", () => {
  it("groups a week across years without accepting partial or invalid dates", () => {
    const items = [
      { date: "2025-12-31", percentage: 0.8 },
      { date: "2026-01-01", percentage: 0.6 },
      { date: "2026-01", percentage: 1 },
      { date: "2026-02-31", percentage: 1 },
    ];
    expect(calculateWeeklySeries(items)).toEqual([
      { inicio: "2025-12-29", inspecciones: 2, promedio: 70, bajo70: 1 },
    ]);
    expect(calculateMonthlySeries(items)).toEqual([
      { period: "2025-12", inspections: 1, compliance: 80 },
      { period: "2026-01", inspections: 1, compliance: 60 },
    ]);
  });
});
