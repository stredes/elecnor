import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardScreen } from "@/dashboard/components/DashboardScreen";

describe("DashboardScreen", () => {
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

    expect(screen.getByText("Inspecciones")).toBeVisible();
    expect(screen.getByRole("link", { name: "Comprobar API" })).toHaveAttribute(
      "href",
      "/api/health",
    );
  });
});
