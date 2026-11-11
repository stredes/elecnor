import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LegacyBellCurveChart, bandCenter, createCurve, createReferenceCurve, estimateStandardDeviation, weightedMean } from "@/dashboard/components/LegacyBellCurveChart";
import { LegacyDonutChart } from "@/dashboard/components/LegacyDonutChart";
import { LegacyProgressChart } from "@/dashboard/components/LegacyProgressChart";

afterEach(cleanup);

describe("executive chart tooltips", () => {
  it("shows the hovered donut slice value and share", () => {
    render(<LegacyDonutChart title="Distribución" label="Distribución de puntajes" slices={[{ label: "80-89", value: 8, display: "8 auditorías", color: "#2d9b68" }, { label: "70-79", value: 2, display: "2 auditorías", color: "#df9e25"}]} />);
    fireEvent.mouseEnter(document.querySelector(".legacy-donut-arc")!);
    expect(screen.getByRole("status")).toHaveTextContent("8 auditorías");
    expect(screen.getByRole("status")).toHaveTextContent("80.0% del total");
  });
  it("shows the exigency level beside each score band", () => {
    render(<LegacyDonutChart title="Distribución" label="Distribución de puntajes" legendMode="distribution" slices={[{ label: "90-99", value: 8 }, { label: "100", value: 2 }]} />);
    expect(screen.getByText("90-99%", { exact: true })).toBeVisible();
    expect(screen.getByText("Nivel 4 · Aceptable", { exact: true })).toBeVisible();
    expect(screen.getByText("Nivel 5 · Buen estado", { exact: true })).toBeVisible();
    expect(document.querySelector(".legacy-donut-distribution-row.is-level-4")).toBeInTheDocument();
  });
  it("renders the evolution without hover values and highlights the real final compliance", () => {
    render(<LegacyProgressChart weeklyProgress={[{ inicio: "2026-06-01", inspecciones: 2, promedio: 70, bajo70: 0 }, { inicio: "2026-06-08", inspecciones: 2, promedio: 86.2, bajo70: 0 }]} />);
    fireEvent.mouseEnter(document.querySelector(".legacy-progress-chart")!);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("1 de junio")).toBeVisible();
    expect(screen.getByText("86.2%", { exact: true })).toBeVisible();
    expect(screen.getByText("Crecimiento observado")).toBeVisible();
    expect(screen.getByText("+16.2%", { exact: true })).toBeVisible();
    expect(screen.getByText(/educación y corrección in situ/i)).toBeVisible();
    expect(document.querySelectorAll(".legacy-progress-chart title")).toHaveLength(0);
    expect([...document.querySelectorAll(".legacy-progress-chart svg text")].map((node) => node.textContent)).not.toContain("86.2%");
    expect(document.querySelectorAll(".legacy-progress-chart a")).toHaveLength(0);
    expect(document.querySelectorAll(".legacy-progress-line")).toHaveLength(1);
    expect(document.querySelectorAll(".legacy-progress-point")).toHaveLength(2);
    const trendLine = document.querySelector<SVGLineElement>(".legacy-progress-line")!;
    expect(Number(trendLine.getAttribute("x1"))).toBeLessThan(Number(trendLine.getAttribute("x2")));
    expect(Number(trendLine.getAttribute("y1"))).toBeGreaterThan(Number(trendLine.getAttribute("y2")));
  });
  it("uses the observed monthly endpoints for one linear summary line", () => {
    render(<LegacyProgressChart progress={[
      { period: "2026-06", inspections: 10, compliance: 79.31 },
      { period: "2026-07", inspections: 10, compliance: 73.7 },
      { period: "2026-08", inspections: 10, compliance: 78.22 },
      { period: "2026-09", inspections: 10, compliance: 79.84 },
    ]} />);
    expect(document.querySelectorAll(".legacy-progress-line")).toHaveLength(1);
    expect(document.querySelectorAll(".legacy-progress-point")).toHaveLength(2);
    const trendLine = document.querySelector<SVGLineElement>(".legacy-progress-line")!;
    expect(Number(trendLine.getAttribute("y1"))).toBeGreaterThan(Number(trendLine.getAttribute("y2")));
  });
  it("uses a 70–90 visual scale for the weekly trend", () => {
    render(<LegacyProgressChart weeklyProgress={[{ inicio: "2026-06-01", inspecciones: 2, promedio: 70, bajo70: 0 }, { inicio: "2026-06-08", inspecciones: 2, promedio: 90, bajo70: 0 }]} />);
    expect(document.querySelectorAll(".legacy-progress-grid")).toHaveLength(1);
    expect(document.querySelector(".legacy-progress-grid")).toHaveTextContent("70%");
    expect(document.querySelector(".legacy-progress-grid")).toHaveTextContent("90%");
  });

  it("does not render an isolated weekly inspection in the evolution chart", () => {
    render(<LegacyProgressChart weeklyProgress={[{ inicio: "2026-06-01", inspecciones: 1, promedio: 40, bajo70: 1 }, { inicio: "2026-06-08", inspecciones: 2, promedio: 80, bajo70: 0 }]} />);
    expect(document.querySelectorAll(".legacy-progress-chart a")).toHaveLength(0);
    expect(document.querySelectorAll(".legacy-progress-point")).toHaveLength(1);
    expect(document.querySelector(".legacy-threshold")).not.toBeInTheDocument();
    expect(screen.queryByText("40%")).not.toBeInTheDocument();
  });

  it("starts the weekly evolution on June 1 and excludes earlier weeks", () => {
    render(<LegacyProgressChart weeklyProgress={[{ inicio: "2026-05-25", inspecciones: 2, promedio: 60, bajo70: 2 }, { inicio: "2026-06-01", inspecciones: 2, promedio: 72.5, bajo70: 0 }, { inicio: "2026-06-08", inspecciones: 2, promedio: 80, bajo70: 0 }]} />);
    expect(document.querySelectorAll(".legacy-progress-point")).toHaveLength(2);
    expect(screen.getByText("1 de junio")).toBeVisible();
    expect(screen.queryByText("25 may")).not.toBeInTheDocument();
  });

  it("shows the hovered score band", () => {
    render(<LegacyBellCurveChart distribution={[{ label: "80-89", count: 8 }, { label: "70-79", count: 2 }]} panorama={{ media: 82, mediana: 82, moda: 82, p25: 75, p75: 88 }} />);
    fireEvent.mouseEnter(document.querySelector(".legacy-bell-bar")!);
    expect(screen.getByRole("status")).toHaveTextContent("Banda 80-89");
    expect(screen.getByRole("status")).toHaveTextContent("8 auditorías");
  });

  it("explains the real bars and reference curve without a fixed threshold", () => {
    render(<LegacyBellCurveChart distribution={[{ label: "80-89", count: 8 }, { label: "70-79", count: 2 }]} panorama={{ media: 82, mediana: 82, moda: 82, p25: 75, p75: 88 }} />);
    expect(screen.getByRole("heading", { name: "Distribución real y campana gaussiana referencial" })).toBeVisible();
    expect(screen.getByText(/las barras muestran cuántas auditorías/i)).toBeVisible();
    expect(screen.queryByText("Umbral preventivo")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Umbral preventivo: 70%" })).not.toBeInTheDocument();
    expect(screen.getByText("Mediana")).toBeVisible();
    expect(screen.getByText("Moda")).toBeVisible();
    expect(document.querySelectorAll(".legacy-bell-stat-level")).toHaveLength(5);
    expect(document.querySelector(".legacy-bell-stat.is-level-3 .legacy-bell-stat-level")).toHaveTextContent("Nivel 3 · Mejorable");
  });

  it("centers the Gaussian reference on the observed mean", () => {
    const points = createCurve(77, 10);
    expect(points.reduce((best, point) => point.y > best.y ? point : best)).toEqual({ x: 77, y: 1 });
  });

  it("uses a left-skewed curve only as a visual reference", () => {
    const points = createReferenceCurve(70, 10, 76, 73);
    const peak = points.reduce((best, point) => point.y > best.y ? point : best);
    expect(peak.x).toBeGreaterThan(70);
    expect(points.find((point) => point.x === 60)!.y).toBeGreaterThan(points.find((point) => point.x === 90)!.y);
  });

  it("uses 100 as the exact center of the 100 band and computes weighted means", () => {
    expect(bandCenter("100")).toBe(100);
    expect(weightedMean([{ label: "50-59", count: 2 }, { label: "100", count: 1 }])).toBeCloseTo(69.6667, 3);
  });

  it("uses P25/P75 for dispersion and falls back to observed bands", () => {
    expect(estimateStandardDeviation([{ label: "50-59", count: 1 }], 60, { media: 60, mediana: 60, moda: 60, p25: 50, p75: 80 })).toBeCloseTo((80 - 50) / 1.349, 5);
    expect(estimateStandardDeviation([{ label: "50-59", count: 1 }, { label: "90-99", count: 1 }], 74.5, { media: 74.5, mediana: 74.5, moda: null, p25: null, p75: null })).toBeGreaterThan(4);
  });

  it("handles empty, single-band, equal and configurable-threshold cases without invalid SVG values", () => {
    const { container, rerender } = render(<LegacyBellCurveChart distribution={[]} panorama={{ media: null, mediana: null, moda: null, p25: null, p75: null }} />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    rerender(<LegacyBellCurveChart distribution={[{ label: "100", count: 3 }]} panorama={{ media: null, mediana: null, moda: null, p25: null, p75: null }} threshold={75} />);
    expect(screen.getByText("Umbral preventivo")).toBeVisible();
    expect(screen.getByText("75%")).toBeVisible();
    expect(container.querySelector("svg")?.innerHTML).not.toMatch(/NaN|Infinity/);
  });
});
