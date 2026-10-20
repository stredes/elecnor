import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DeferredReporting } from "@/dashboard/components/DeferredReporting";
import type { LegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";

const report = { kpis: { inspeccionesUnicas: 2 } } as LegacyDashboardModel;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DeferredReporting", () => {
  it("shows the skeleton until the BFF response arrives", () => {
    vi.spyOn(global, "fetch").mockReturnValue(new Promise<Response>(() => {}));
    render(<DeferredReporting fallback={<p data-testid="report-skeleton">Cargando</p>}>
      {(value) => <p>{value.kpis.inspeccionesUnicas}</p>}
    </DeferredReporting>);

    expect(screen.getByTestId("report-skeleton")).toBeVisible();
  });

  it("loads the report through the Next BFF", async () => {
    const fetcher = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => report,
    } as Response);
    render(<DeferredReporting fallback={<p>Cargando</p>}>
      {(value) => <p>Inspecciones: {value.kpis.inspeccionesUnicas}</p>}
    </DeferredReporting>);

    await waitFor(() => expect(screen.getByText("Inspecciones: 2")).toBeVisible());
    expect(fetcher).toHaveBeenCalledWith("/api/reporting", expect.objectContaining({ method: "GET" }));
  });
});
