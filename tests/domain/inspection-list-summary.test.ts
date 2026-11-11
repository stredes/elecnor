import { describe, expect, it } from "vitest";
import type { InspectionListItem } from "@/backend/domain/inspection-list-contract";
import { summarizeInspectionList } from "@/backend/domain/inspection-list-summary";

const base: InspectionListItem = {
  id: "1", date: null, time: null, technician: null, auditor: null, address: null,
  city: null, region: null, percentage: 80, score: null, maxScore: null, actions: null,
  rubric: null, status: "COMPLETA", filename: null,
};

describe("summarizeInspectionList", () => {
  it("calculates status percentages over the complete filtered result", () => {
    const result = summarizeInspectionList([
      base, { ...base, id: "2", percentage: 60 },
      { ...base, id: "3", status: "PARCIAL" }, { ...base, id: "4", percentage: null, status: null },
    ]);
    expect(result).toMatchObject({ total: 4, scored: 3, average: 73.33, missingAuditor: 4, complete: 1, attention: 2, missing: 1, completePercentage: 25, attentionPercentage: 50, missingPercentage: 25 });
  });
});
