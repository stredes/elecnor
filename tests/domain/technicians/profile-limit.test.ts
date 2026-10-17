import { describe, expect, it } from "vitest";
import { selectTechnicianProfile } from "@/backend/domain/technicians/select-profile";

const inspections = Array.from({ length: 501 }, (_, index) => ({
  id: `I-${index}`, technician: "Ana", date: "2026-01-01", percentage: 80,
}));

describe("NP-0036 technician profile boundaries", () => {
  it("keeps the legacy universe at 500 rows and preserves source order", () => {
    const result = selectTechnicianProfile(inspections, "Ana");
    expect(result).toHaveLength(500);
    expect(result[0].id).toBe("I-0");
    expect(result.at(-1)?.id).toBe("I-499");
  });

  it("does not return another technician's rows", () => {
    expect(selectTechnicianProfile(inspections, "Bruno")).toEqual([]);
  });
});
