import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LegacyBellCurveChart } from "@/dashboard/components/LegacyBellCurveChart";
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

  it("shows the hovered progress period", () => {
    render(<LegacyProgressChart progress={[{ period: "2026-01", inspections: 4, compliance: 72 }]} />);
    fireEvent.mouseEnter(document.querySelector(".legacy-progress-chart a")!);
    expect(screen.getByRole("status")).toHaveTextContent("72% de cumplimiento");
    expect(screen.getByRole("status")).toHaveTextContent("4 inspecciones");
  });

  it("shows the hovered score band", () => {
    render(<LegacyBellCurveChart distribution={[{ label: "80-89", count: 8 }, { label: "70-79", count: 2 }]} panorama={{ media: 82, mediana: 82, p25: 75, p75: 88 }} />);
    fireEvent.mouseEnter(document.querySelector(".legacy-bell-bar")!);
    expect(screen.getByRole("status")).toHaveTextContent("Banda 80-89");
    expect(screen.getByRole("status")).toHaveTextContent("8 auditorías");
  });

  it("explains the real bars, reference curve and preventive threshold", () => {
    render(<LegacyBellCurveChart distribution={[{ label: "80-89", count: 8 }, { label: "70-79", count: 2 }]} panorama={{ media: 82, mediana: 82, p25: 75, p75: 88 }} />);
    expect(screen.getByRole("heading", { name: "Distribución real y referencia gaussiana" })).toBeVisible();
    expect(screen.getByText(/las barras muestran cuántas auditorías/i)).toBeVisible();
    expect(screen.getByRole("img", { name: "Umbral preventivo: 70%" })).toBeVisible();
    expect(screen.getByText("Mediana")).toBeVisible();
  });
});
