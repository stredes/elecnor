import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createDashboardSnapshot } from "@/backend/domain/dashboard";
import { fallbackLegacyDashboard } from "@/dashboard/contracts/legacy-dashboard-contract";
import { LegacyDashboardSections } from "@/dashboard/components/LegacyDashboardSections";

afterEach(cleanup);

describe("LegacyDashboardSections", () => {
  it("shows the EPP condition and maintenance observation in point 5", () => {
    const model = fallbackLegacyDashboard(createDashboardSnapshot([], "now"));

    render(<LegacyDashboardSections model={model} />);

    const point5 = screen.getByRole("heading", { name: "Contraste dentro del bloque EPP" }).closest("section");
    expect(point5).not.toBeNull();
    expect(within(point5 as HTMLElement).getByText("Nombre")).toBeVisible();
    expect(within(point5 as HTMLElement).getByText("% de cumplimiento")).toBeVisible();
    expect(within(point5 as HTMLElement).getByText(/Se ocupan los EPP, pero no se registra ningún control/)).toBeVisible();
    expect(screen.getByText(/estado en que se encuentra el EPP ni sobre sus mantenciones/)).toBeVisible();
  });
});
