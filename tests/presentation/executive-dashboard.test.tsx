import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExecutiveDashboard } from "@/dashboard/components/ExecutiveDashboard";
import { toLegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";
import { syntheticReportingQuery } from "@/backend/composition/synthetic-reporting";

vi.mock("next/router", () => ({ useRouter: () => ({ asPath: "/", replace: vi.fn() }) }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("ExecutiveDashboard", () => {
  it("renders real KPIs, ordered regional evidence and the people sample", async () => {
    const model = toLegacyDashboardModel(await syntheticReportingQuery.execute());
    render(<ExecutiveDashboard model={model} generatedAt="2026-11-09T12:00:00.000Z" />);
    expect(screen.getByRole("heading", { name: "Dashboard Ejecutivo" })).toBeVisible();
    expect(screen.getByText("Resultado consolidado")).toBeVisible();
    expect(screen.getByText("Portal oficial")).toBeVisible();
    expect(screen.queryByText("Región con más hallazgos")).not.toBeInTheDocument();
    expect(screen.getByText("Falencias identificadas")).toBeVisible();
    expect(screen.getByText("Lectura para la conclusión")).toBeVisible();
    expect(screen.getByText("Recomendaciones para cerrar brechas")).toBeVisible();
    expect(screen.getByText("Priorizar la brecha más crítica")).toBeVisible();
    expect(screen.getByRole("link", { name: /Abrir prioridad:/i })).toBeVisible();
    expect(screen.getByText("72.5%", { exact: false })).toBeVisible();
    expect(screen.getByRole("option", { name: "Maule" })).toBeVisible();
    expect(screen.queryByText("Lectura cualitativa")).not.toBeInTheDocument();
    expect(screen.queryByText("Tres pilares preventivos")).not.toBeInTheDocument();
    expect(screen.queryByText("Conocimiento técnico insuficiente")).not.toBeInTheDocument();
    expect(screen.queryByText("Cultura preventiva débil")).not.toBeInTheDocument();
    expect(screen.queryByText("Producción por encima de la seguridad")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Ver conclusión del proyecto/i })).not.toBeInTheDocument();
    const mauleLink = screen.getAllByRole("link", { name: /Ver auditorías/i }).find((link) => link.getAttribute("href") === "/inspecciones?region=Maule");
    expect(mauleLink).toBeDefined();
    const expectedRegionOrder = [...model.regions].sort((left, right) => {
      if (left.compliance === null) return right.compliance === null ? 0 : 1;
      if (right.compliance === null) return -1;
      return left.compliance - right.compliance;
    }).map((region) => region.region);
    expect([...document.querySelectorAll(".executive-region-row strong")].map((node) => node.textContent)).toEqual(expectedRegionOrder);
    expect(document.querySelector(".executive-primary-grid .executive-section-panel")).toBeInTheDocument();
    expect(document.querySelector(".executive-primary-grid .executive-distribution-panel")).toBeInTheDocument();
    expect(screen.getByText("Registros en trabajo en altura")).toBeVisible();
    expect(screen.getByText("Registros en trabajo en piso")).toBeVisible();
    expect(screen.getByRole("link", { name: /Registros en trabajo en altura/ })).toHaveTextContent(String(model.kpis.inspeccionesAltura));
    expect(screen.getByRole("link", { name: /Registros en trabajo en piso/ })).toHaveTextContent(String(model.kpis.inspeccionesPiso));
    expect(screen.getByText("Inspecciones clasificadas en ALTURA")).toBeVisible();
    expect(screen.getByText("Inspecciones clasificadas en PISO")).toBeVisible();
    expect(screen.queryByText("Umbrales por indicador")).not.toBeInTheDocument();
    expect(screen.getByText(/PDFs importados · reimportaciones o duplicados consolidados/)).toBeVisible();
    expect(screen.queryByText("Auditorías prioritarias")).not.toBeInTheDocument();
    expect(screen.queryByText(/70%/)).not.toBeInTheDocument();
    expect(screen.queryByText("Cumplen el estándar")).not.toBeInTheDocument();
    expect(screen.queryByText("Bajo el estándar")).not.toBeInTheDocument();
    expect(screen.queryByText("Puntaje perfecto")).not.toBeInTheDocument();
    expect(screen.queryByText("Resultado observado")).not.toBeInTheDocument();
    expect(screen.queryByText("Base evaluada")).not.toBeInTheDocument();
    expect(screen.queryByText("Personas bajo 90%")).not.toBeInTheDocument();
    const distributionHeader = document.querySelector(".executive-distribution-panel .legacy-donut-legend-header-distribution");
    expect(distributionHeader).toHaveTextContent("Puntaje / nivel");
    expect(distributionHeader).toHaveTextContent("% del total");
    expect(distributionHeader).toHaveTextContent("Cantidad");
    expect(screen.getByText("Evolución del proyecto")).toBeVisible();
    expect(screen.getByText("Progreso preventivo")).toBeVisible();
    expect(screen.getByText(/educación y las correcciones in situ/i)).toBeVisible();
    expect(screen.queryByRole("img", { name: "Distribución real de puntajes y referencia de campana de Gauss" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resultado promedio por persona" })).toBeVisible();
    expect(screen.getByText("Métrica de la muestra")).toBeVisible();
    expect(screen.getByText("2 personas")).toBeVisible();
    expect(screen.getByText("Deficiente", { exact: true })).toBeVisible();
    expect(screen.getByText("Mejorable", { exact: true })).toBeVisible();
    const peopleSample = screen.getByRole("list", { name: "Personas por nivel de cumplimiento" });
    expect(within(peopleSample).getAllByText("50.0%")).toHaveLength(2);
    expect(document.querySelector("[aria-label='Leyenda de estatus de las métricas']")).toBeInTheDocument();
  });

  it("keeps rendering when a previous service-worker response lacks context people counts", async () => {
    const model = toLegacyDashboardModel(await syntheticReportingQuery.execute());
    const cachedModel = { ...model, kpis: { ...model.kpis, inspeccionesAltura: undefined, inspeccionesPiso: undefined } };
    render(<ExecutiveDashboard model={cachedModel} generatedAt="2026-11-09T12:00:00.000Z" />);
    expect(screen.getByText("Registros en trabajo en altura")).toBeVisible();
    expect(screen.getByText("Registros en trabajo en piso")).toBeVisible();
  });
});
