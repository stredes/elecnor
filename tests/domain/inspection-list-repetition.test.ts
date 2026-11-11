import { describe, expect, it } from "vitest";
import type { InspectionListItem } from "@/backend/domain/inspection-list-contract";
import { findRepeatedInspectionGroups } from "@/backend/domain/inspection-list-repetition";

function inspection(id: string, technician: string, time: string): InspectionListItem {
  return { id, date: "2026-01-10", time, technician, auditor: "Auditor A", address: null } as unknown as InspectionListItem;
}

describe("findRepeatedInspectionGroups", () => {
  it("groups only the same worker on the same day with different times", () => {
    const groups = findRepeatedInspectionGroups([
      inspection("one", "Trabajador A", "08:00"),
      inspection("two", "Trabajador A", "11:30"),
      inspection("three", "Trabajador B", "12:00"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ technician: "Trabajador A", date: "2026-01-10" });
    expect(groups[0]?.inspections).toHaveLength(2);
  });
});
