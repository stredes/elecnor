import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LegacyMetricsPage } from "@/dashboard/components/LegacyMetricsPage";
import { fallbackLegacyDashboard } from "@/dashboard/contracts/legacy-dashboard-contract";

afterEach(cleanup);

describe("LegacyMetricsPage", () => {
  it("presenta un resumen visual y prepara las superficies con entrada blur", () => {
    const model = fallbackLegacyDashboard({
      status: "healthy",
      generatedAt: "now",
      metrics: [{ id: "inspections", label: "Inspecciones", value: "12", trend: "" }],
    });

    const { container } = render(<LegacyMetricsPage model={model} />);

    expect(screen.getByRole("heading", { name: "Indicadores clave" })).toBeVisible();
    expect(container.querySelector(".legacy-metrics-report")).toHaveClass("hc-report-enter");
    expect(container.querySelector(".legacy-chart-panel")).toHaveClass("legacy-glass-surface");
    expect(container.querySelectorAll(".hc-donut-data-enter").length).toBeGreaterThan(0);
  });
});
