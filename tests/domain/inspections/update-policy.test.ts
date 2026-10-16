import { describe, expect, it } from "vitest";
import { buildInspectionMetadataUpdate } from "@/backend/domain/inspections/update-policy";

describe("inspection metadata update policy", () => {
  it("whitelists metadata and marks the resulting inspection partial", () => {
    expect(buildInspectionMetadataUpdate({ technician: "Técnico B", observation: null })).toEqual({
      changes: { technician: "Técnico B", observation: null }, status: "PARCIAL",
    });
  });

  it("rejects score, metric and oversized fields", () => {
    expect(() => buildInspectionMetadataUpdate({ score: 10 })).toThrow();
    expect(() => buildInspectionMetadataUpdate({ technician: "x".repeat(501) })).toThrow();
  });
});
