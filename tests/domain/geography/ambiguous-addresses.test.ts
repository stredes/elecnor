import { describe, expect, it } from "vitest";
import {
  extractCity,
  recoverRegion,
  resolveRegion,
} from "@/backend/domain/geography/resolve-location";

describe("NP-0036/AC-02/TEST-02 geography boundaries", () => {
  it("does not interpret a street name as the city", () => {
    expect(extractCity("Calle Santiago 10, Renca")).toBe("Renca");
  });

  it("keeps legacy address hints and filename recovery", () => {
    expect(resolveRegion(null, "Calle 23 Nte 10")).toBe("Maule");
    expect(resolveRegion(null, "(-35.409009, -71.6258038)")).toBe("Maule");
    expect(recoverRegion(null, null, "informe_Concepcion.pdf")).toBe("Biobío");
  });

  it("does not infer a city from coordinate-only text", () => {
    expect(extractCity("(-33.4, -70.6)")).toBeNull();
  });
});
