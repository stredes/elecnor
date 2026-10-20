import { describe, expect, it } from "vitest";
import { normalizeTechnicianName, areTechniciansEquivalent } from "@/backend/domain/guard/technician-normalize";

describe("technician name normalization", () => {
  it("normalizes accents and case", () => {
    expect(normalizeTechnicianName("Rainer Rodríguez")).toBe("rainer rodriguez");
    expect(normalizeTechnicianName("RAINER RODRÍGUEZ")).toBe("rainer rodriguez");
    expect(normalizeTechnicianName("  Rainer   Rodriguez  ")).toBe("rainer rodriguez");
    expect(normalizeTechnicianName(null)).toBeNull();
    expect(normalizeTechnicianName("")).toBeNull();
  });

  it("unifies rodriguez vs rodrigues (Levenshtein distance 1)", () => {
    expect(areTechniciansEquivalent("rainer rodriguez", "rainer rodrigues")).toBe(true);
    expect(areTechniciansEquivalent("Rainer Rodríguez", "Rainer Rodrigues")).toBe(true);
    expect(areTechniciansEquivalent("rodriguez", "rodrigues")).toBe(true);
  });

  it("does not unify clearly different names", () => {
    expect(areTechniciansEquivalent("rainer rodriguez", "diego balboa")).toBe(false);
    expect(areTechniciansEquivalent("rainer", "rodriguez")).toBe(false);
    expect(areTechniciansEquivalent(null, "rainer")).toBe(false);
    expect(areTechniciansEquivalent("", "rainer")).toBe(false);
  });

  it("returns true for exact match after normalization", () => {
    expect(areTechniciansEquivalent("Rainer Rodriguez", "rainer rodriguez")).toBe(true);
    expect(areTechniciansEquivalent("ANER GARCIA", "aner garcia")).toBe(true);
  });
});