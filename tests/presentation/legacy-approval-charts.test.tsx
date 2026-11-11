import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { LegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";
import { LegacyApprovalCharts } from "@/dashboard/components/LegacyApprovalCharts";

afterEach(cleanup);

describe("LegacyApprovalCharts", () => {
  it("labels the metric and compliance columns", () => {
    const model = {
      kpis: { inspeccionesUnicas: 2 },
      sectionInspections: [{ name: "seguridad", total: 2, evaluated: 2, approved: 1, belowThreshold: 1, notEvaluated: 0, approvalPercentage: 50, approvalThreshold: 70 }],
      sections: [{ name: "seguridad", metrics: [{ metric: "Uso casco", compliance: 80 }] }],
    } as unknown as LegacyDashboardModel;

    render(<LegacyApprovalCharts model={model} />);

    expect(screen.getByText("Nombre métrica")).toBeVisible();
    expect(screen.getAllByText("Nombre")).toHaveLength(1);
    expect(screen.getAllByText("% de cumplimiento")).toHaveLength(2);
  });
});
