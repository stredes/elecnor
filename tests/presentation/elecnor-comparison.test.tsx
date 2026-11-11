import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ElecnorComparisonResult, ElecnorWorker } from "@/backend/domain/elecnor-contract";
import { ElecnorComparisonTable } from "@/elecnor/ElecnorComparisonTable";
import { ElecnorComparisonView } from "@/elecnor/ElecnorComparisonView";

function result(total: number, name: string | null): ElecnorComparisonResult {
  const data = name ? [{ worker_id: "ELECNOR-1", rut: "12.345.678-5", name,
    name_detected: null, commune: null, supervisor: null, reviewed: false,
    review_note: null, status: "SIN_INSPECCION" as const, inspection_count: 0, inspections: [] }] : [];
  return { data, total, limit: 25, offset: 0, metrics: { total_workers: total,
    with_inspection: 0, without_inspection: total, exact_matches: 0, variant_matches: 0,
    reviewed: 0, pending_review: total } };
}

const query = { q: "", status: "all" as const };

function workerWithInspections(workerId: string, count: number): ElecnorWorker {
  const inspections = Array.from({ length: count }, (_, index) => ({
    audit_id: `${workerId}-audit-${index + 1}`, filename: null, sha256: `hash-${index + 1}`,
    blob_url: null, technician_detected: null, technician_normalized: null,
    technician_canonical: null, inspection_date: null, inspection_time: null,
    technician_rut: null, percentage: null, match_kind: "RUT_EXACTO" as const, match_score: 1,
  }));
  return { worker_id: workerId, rut: "12.345.678-5", name: workerId, name_detected: null,
    commune: null, supervisor: null, reviewed: false, review_note: null,
    status: "INSPECCION_ENCONTRADA", inspection_count: count, inspections };
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Elecnor comparison stale cache recovery", () => {
  it("revalidates an empty SSR payload and renders current workers", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => result(165, "Clara Ficticia Norte") });
    vi.stubGlobal("fetch", fetcher);
    render(<ElecnorComparisonView initial={result(0, null)} query={query} loadError={false} />);
    expect(await screen.findByText("Clara Ficticia Norte")).toBeVisible();
    expect(screen.getByText("Trabajadores").closest("div")).toHaveTextContent("165");
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("/api/elecnor/comparison?"),
      expect.objectContaining({ cache: "no-store" }));
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("limit=25"), expect.anything());
  });

  it("shows a connection error instead of an empty roster when SSR failed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<ElecnorComparisonView initial={result(0, null)} query={query} loadError />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo cargar la comparativa");
    expect(screen.queryByText("No hay trabajadores para este filtro.")).not.toBeInTheDocument();
  });

  it("presents comparison data with a readable hierarchy", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(<ElecnorComparisonView initial={result(165, "Clara Ficticia Norte")} query={query} loadError={false} />);
    expect(screen.getByRole("heading", { name: "Lectura rápida de la comparativa" })).toBeVisible();
    expect(screen.getByLabelText("Buscar trabajador")).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Trabajador" })).toBeVisible();
    expect(screen.getByText("Cobertura encontrada")).toBeVisible();
  });

  it("does not refetch a healthy SSR payload", () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<ElecnorComparisonView initial={result(165, "Clara Ficticia Norte")} query={query} loadError={false} />);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("loads the next page without requesting the full comparison", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => result(165, "Clara Ficticia Norte") });
    vi.stubGlobal("fetch", fetcher);
    render(<ElecnorComparisonView initial={result(0, null)} query={query} loadError={false} />);
    await screen.findByText("Clara Ficticia Norte");
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("offset=25"), expect.anything()));
    expect(fetcher).toHaveBeenCalledWith(expect.stringContaining("limit=25"), expect.anything());
  });
});

describe("Elecnor comparison inspection links", () => {
  it("shows no more than seven audits per worker and preserves their total count", () => {
    render(<ElecnorComparisonTable rows={[workerWithInspections("Worker A", 9), workerWithInspections("Worker B", 8)]} onReview={vi.fn()} />);
    const rows = screen.getAllByRole("row").slice(1);
    for (const row of rows) expect(within(row).getAllByRole("link")).toHaveLength(7);
    expect(within(rows[0]).getByRole("link", { name: "Abrir inspección Worker A-audit-7" })).toBeVisible();
    expect(within(rows[0]).queryByRole("link", { name: "Abrir inspección Worker A-audit-8" })).not.toBeInTheDocument();
    expect(within(rows[0]).getByText("9 registros")).toBeVisible();
    expect(within(rows[0]).queryByText("Mostrando 7 de 9 registros")).not.toBeInTheDocument();
    expect(within(rows[0]).queryByText("9 inspecciones asociadas")).not.toBeInTheDocument();
  });

  it("exposes sortable column headers", () => {
    const onSort = vi.fn();
    render(<ElecnorComparisonTable rows={[]} onReview={vi.fn()} onSort={onSort} />);
    fireEvent.click(screen.getByRole("button", { name: "Trabajador" }));
    expect(onSort).toHaveBeenCalledWith("name");
    expect(screen.getByRole("columnheader", { name: "Trabajador" })).toHaveAttribute("aria-sort", "ascending");
  });

  it("normalizes partial inspection dates for comparison rows", () => {
    const worker = workerWithInspections("Worker Date", 1);
    const inspection = { ...worker.inspections[0], inspection_date: "31.07" };
    render(<ElecnorComparisonTable rows={[{ ...worker, inspections: [inspection] }]} onReview={vi.fn()} />);
    expect(screen.getByText("31/07/2026")).toBeVisible();
  });
});
