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
});
