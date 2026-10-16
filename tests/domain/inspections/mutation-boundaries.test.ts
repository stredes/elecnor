import { describe, expect, it } from "vitest";
import { guardInspectionMutation } from "@/backend/domain/inspections/mutation-boundaries";

describe("inspection mutation boundaries", () => {
  it("rejects invalid identifiers and immutable fields before effects", () => {
    expect(guardInspectionMutation("", { technician: "A" })).toMatchObject({ ok: false });
    expect(guardInspectionMutation("inspection-1", { score: 10 })).toMatchObject({ ok: false });
  });

  it("returns a partial metadata update for an allowed payload", () => {
    expect(guardInspectionMutation("inspection-1", { auditor: "Auditor B" })).toMatchObject({
      ok: true, id: "inspection-1", update: { status: "PARCIAL" },
    });
  });
});
