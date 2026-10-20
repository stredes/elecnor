import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardScreen } from "@/dashboard/components/DashboardScreen";

describe("DashboardScreen", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows synthetic metrics and the API link", () => {
    render(
      <DashboardScreen
        snapshot={{
          status: "healthy",
          generatedAt: "now",
          metrics: [{
            id: "one",
            label: "Inspecciones",
            value: "1",
            trend: "+1%",
          }],
        }}
      />,
    );

    expect(within(screen.getByRole("region", { name: "Indicadores principales" })).getByText("Inspecciones")).toBeVisible();
    expect(screen.getByRole("link", { name: "Comprobar API" })).toHaveAttribute(
      "href",
      "/api/health",
    );
  });

  it("shows the summary while the detailed report is loading", () => {
    vi.spyOn(global, "fetch").mockReturnValue(new Promise<Response>(() => {}));
    render(<DashboardScreen snapshot={{ status: "healthy", generatedAt: "now", metrics: [{ id: "one", label: "Inspecciones", value: "1", trend: "+1%" }] }} deferReport />);
    expect(within(screen.getByRole("region", { name: "Indicadores principales" })).getByText("Inspecciones")).toBeVisible();
  });
});
