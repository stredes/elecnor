import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { DashboardView } from "@/dashboard/views/DashboardView";
import { MetricsView } from "@/dashboard/views/MetricsView";
import type { DashboardSnapshot } from "@/backend/domain/dashboard";

const snapshot: DashboardSnapshot = {
  status: "healthy",
  generatedAt: "synthetic",
  metrics: [{ id: "inspections", label: "Inspecciones", value: "4", trend: "+1%" }],
};

afterEach(cleanup);

describe("NP-0041/AC-01/TEST-01 presentation composition", () => {
  it("composes the dashboard inside the shared report layout", () => {
    render(<DashboardView snapshot={snapshot} />);

    expect(screen.getByRole("link", { name: "Elecnor · Inicio" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Métricas" })).toHaveAttribute("href", "/metricas");
    expect(screen.getByRole("heading", { name: "Panel de inspecciones" })).toBeVisible();
    expect(screen.getByText("Inspecciones")).toBeVisible();
  });

  it("keeps the metrics view presentational and accessible with empty data", () => {
    render(<MetricsView snapshot={{ ...snapshot, metrics: [] }} />);

    expect(screen.getByRole("heading", { name: "Métricas" })).toBeVisible();
    expect(screen.getByText("No hay métricas para mostrar.")).toBeVisible();
    expect(screen.getByRole("main")).toHaveAttribute("id", "contenido");
  });
});
