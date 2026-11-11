import { describe, expect, it } from "vitest";
import { recoverRegion } from "@/backend/domain/geography/resolve-location";

describe("NP-0036/AC-01/TEST-01 territory resolution", () => {
  it("uses filename only as the final regional fallback", () => {
    expect(recoverRegion(null, null, "inspeccion_Talca_01.pdf")).toBe("Maule");
    expect(recoverRegion(null, "Calle sin ciudad", "archivo_sin_region.pdf")).toBeNull();
  });

  it("prefers an explicit city over an ambiguous address fragment", () => {
    expect(recoverRegion("Talca", "Calle Santiago 10, Chile", null)).toBe("Maule");
  });

  it.each([
    ["Pje Mercedes4555", "Región Metropolitana"],
    ["Av Las Nieves 780, Machali⁰", "O'Higgins"],
    ["Pje Lago Sarmiento 0456", "O'Higgins"],
    ["El Trapiche 3152 Depto 706 Torre, E", "O'Higgins"],
    ["Emma Jauch Jelves 1429", "Maule"],
    ["Pasaje Jiménez 22", "Valparaíso"],
    ["Agustín Avezón 99 Block B", "Valparaíso"],
    ["La Parva 684", "Valparaíso"],
    ["29 y media sur 1303", "Maule"],
    ["veintidós norte #3960", "Valparaíso"],
    ["27 y media otiente 63", "Maule"],
    ["valle de Elicura 0280", "O'Higgins"],
    ["Camino a Tuniche 2781", "O'Higgins"],
  ])("recovers the region from a previously unclassified address: %s", (address, region) => {
    expect(recoverRegion(null, address, null)).toBe(region);
  });

  it("recovers the region documented in the PDF when Mitti omitted its address field", () => {
    expect(recoverRegion(null, null, "075_5c8fbed181264770ae06aeed1531efb9.pdf")).toBe("Maule");
  });
});
