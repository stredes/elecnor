import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createDashboardSnapshot } from "@/backend/domain/dashboard";
import { fallbackLegacyDashboard } from "@/dashboard/contracts/legacy-dashboard-contract";
import { LegacyMetricsVisualizations } from "@/dashboard/components/LegacyMetricsVisualizations";

afterEach(cleanup);

describe("LegacyMetricsVisualizations", () => {
  it("shows the audit observation in its own block below geolocation", () => {
    const model = {
      ...fallbackLegacyDashboard(createDashboardSnapshot([], "now")),
      repeatedInspectionGroups: [{
        technician: "Trabajador A",
        date: "10.01",
        inspections: [{ id: "inspection-1", time: "08:00", technician: "Trabajador A", auditor: "Auditor A", address: "Calle 1" }, { id: "inspection-2", time: "11:30", technician: "Trabajador A", auditor: "Auditor A", address: "Calle 2" }],
      }],
    };

    render(<LegacyMetricsVisualizations model={model} />);

    const observation = screen.getByRole("note", { name: "Observación sobre las auditorías" });
    expect(observation).toBeVisible();
    expect(observation).toHaveTextContent("más de una inspección en el mismo día");
    expect(observation).toHaveTextContent("Auditorías identificadas");
    expect(observation).toHaveTextContent("Trabajador A");
    expect(observation).toHaveTextContent("Auditor: Auditor A");
    expect(observation).toHaveTextContent("10/01/2026");
    expect(observation.closest(".legacy-location-card")).toBeNull();
  });
});
