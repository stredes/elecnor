// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { LegacyCoverageMap } from "@/dashboard/components/LegacyCoverageMap";
import type { LegacyDashboardModel } from "@/dashboard/contracts/legacy-dashboard-contract";

const data: LegacyDashboardModel["geolocalizacion"] = {
  total: 12,
  con_geolocalizacion: 12,
  sin_geolocalizacion: 0,
  porcentaje_con_geolocalizacion: 100,
  direcciones_clasificadas: 12,
  direcciones_pendientes: 0,
  porcentaje_direcciones_clasificadas: 100,
  por_region: [
    { region: "Maule", total: 5 },
    { region: "Región Metropolitana", total: 7 },
  ],
};

afterEach(() => cleanup());

describe("LegacyCoverageMap", () => {
  it("selects a region and exposes its inspection link", () => {
    render(<LegacyCoverageMap data={data} />);

    fireEvent.click(screen.getByRole("button", { name: "Maule: 5 inspecciones. Seleccionar región" }));

    expect(screen.getByText("Región seleccionada")).toBeVisible();
    expect(screen.getByText("Maule", { selector: "strong" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Ver inspecciones de esta región/ })).toHaveAttribute(
      "href",
      "/inspecciones?region=Maule",
    );
  });

  it("makes the country shape and inspection markers easier to read", () => {
    const { container } = render(<LegacyCoverageMap data={data} />);
    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "180 20 680 900");
    expect(screen.getByRole("button", { name: "Atacama: 0 inspecciones. Seleccionar región" })
      .querySelector(".legacy-map-marker")).toHaveAttribute("r", "10");
    expect(screen.getByRole("button", { name: "Región Metropolitana: 7 inspecciones. Seleccionar región" })
      .querySelector(".legacy-map-marker")).toHaveAttribute("r", "18");
  });

  it("previews a region while hovering its marker", () => {
    render(<LegacyCoverageMap data={data} />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Región Metropolitana: 7 inspecciones. Seleccionar región" }));

    expect(screen.getByText("Vista previa")).toBeVisible();
    expect(screen.getByText("Región Metropolitana", { selector: "strong" })).toBeVisible();
  });
});
