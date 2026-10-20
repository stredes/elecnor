import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LegacySiteHeader } from "@/dashboard/components/LegacySiteHeader";
import { FindingsView } from "@/dashboard/views/FindingsView";
import { LogsView } from "@/dashboard/views/LogsView";
import { UnknownsView } from "@/dashboard/views/UnknownsView";

afterEach(cleanup);

describe("legacy support surfaces", () => {
  it("exposes only the requested primary navigation", () => {
    render(<LegacySiteHeader activeRoute="findings" />);
    expect(screen.getByRole("link", { name: "Importar PDFs" })).toHaveAttribute("href", "/importar");
    expect(screen.queryByRole("link", { name: "Hallazgos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sin clasificar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Registro" })).not.toBeInTheDocument();
  });

  it("renders findings, unknown metrics and import logs from their read models", () => {
    render(<FindingsView result={{ count: 1, data: [{ id: "F-1", inspectionId: "A-1", date: "2026-01-01", section: "EPP", metric: "Casco", response: "No", observation: "Falta", actionStatus: "SIN_ACCION" }] }} />);
    expect(screen.getByRole("heading", { name: "Hallazgos" })).toBeVisible();
    expect(screen.getByRole("link", { name: "A-1" })).toHaveAttribute("href", "/inspecciones/A-1");
    cleanup();

    render(<UnknownsView result={{ count: 1, data: [{ id: "U-1", inspectionId: "A-1", metric: "Texto", normalized: "texto", status: "PENDIENTE", assignedCode: null, filename: "a.pdf" }] }} />);
    expect(screen.getByText("Métricas sin clasificar")).toBeVisible();
    cleanup();

    render(<LogsView result={{ count: 1, data: [{ id: "L-1", datetime: "2026-01-01", type: "INFO", file: "a.pdf", inspectionId: "A-1", result: "OK", message: "Procesado", duration: 10 }] }} />);
    expect(screen.getByText("Registro de importación")).toBeVisible();
    expect(screen.getByText("10 ms")).toBeVisible();
  });
});
