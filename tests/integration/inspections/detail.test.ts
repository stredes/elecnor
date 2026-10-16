import { describe, expect, it } from "vitest";
import { GetInspectionDetail } from "@/backend/application/inspections/get-inspection-detail";
import { MemoryInspectionDetailReader } from "@/backend/adapters/outbound/memory-inspection-detail-reader";
import type { InspectionDetail } from "@/backend/domain/inspections/detail-contract";

describe("NP-0037/AC-01/TEST-01 inspection detail", () => {
  it("reads a synthetic detail and returns null for an unknown id", async () => {
    const detail = syntheticDetail();
    const useCase = new GetInspectionDetail(new MemoryInspectionDetailReader([detail]));

    await expect(useCase.execute("inspection-1")).resolves.toEqual(detail);
    await expect(useCase.execute("missing")).resolves.toBeNull();
  });
});

function syntheticDetail(): InspectionDetail {
  return {
    inspection: {
      id: "inspection-1", filename: "original.pdf", date: "2026-01-10", time: "09:00",
      technician: "Técnico A", auditor: "Auditor A", auditorRole: null, address: "Calle 1",
      city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10,
      actions: 0, rubric: "SYN", status: "COMPLETA", observation: null,
    },
    metrics: [{
      id: "metric-1", section: "EPP", metric: "Casco", code: "EPP-01", status: "CONFORME",
      applicable: 1, conforming: 1, nonConforming: 0, notApplicable: 0, observation: null,
    }],
  };
}
