import { describe, expect, it } from "vitest";
import { parseInspectionDetail } from "@/backend/domain/inspections/detail-contract";

describe("inspection detail contract", () => {
  it("falls back to original metric names without changing the score", () => {
    const detail = parseInspectionDetail({
      inspection: inspection(),
      metrics: [{
        id: "metric-1", sectionNormalized: null, sectionOriginal: "EPP",
        metricNormalized: "", metricOriginal: "Casco", metricCode: "EPP-01",
        status: "NO CONFORME", applicable: 2, conforming: 1,
        nonConforming: 1, notApplicable: 0, observation: "Falta casco",
      }],
    });

    expect(detail.inspection.score).toBe(8);
    expect(detail.metrics[0]).toMatchObject({
      section: "EPP", metric: "Casco", code: "EPP-01",
    });
  });

  it("rejects a detail without an inspection or metric collection", () => {
    expect(() => parseInspectionDetail({ inspection: inspection() })).toThrow();
  });

  it("maps the FastAPI source contract while dropping its Drive identifier", () => {
    const detail = parseInspectionDetail({
      inspection: inspection(), metrics: [], source: {
        drive_file_id: "drive-secret", filename: "original.pdf", mime_type: "application/pdf",
        size_bytes: 10, sha256: "a".repeat(64), source_modified_at: "2026-10-19T10:00:00Z",
        source_created_at: "2026-10-18T10:00:00Z", provenance: { source_system: "GOOGLE_DRIVE", received_at: "2026-10-19T10:01:00Z" },
      },
    });
    expect(detail.inspection.provenance).toMatchObject({ filename: "original.pdf", sha256: "a".repeat(64), origin: "GOOGLE_DRIVE" });
    expect(detail.inspection.provenance).not.toHaveProperty("driveFileId");
  });

  it("carries the uniqueness block through to the detail", () => {
    const detail = parseInspectionDetail({
      inspection: { ...inspection(), uniqueness: { sha256: "c".repeat(64), technician_normalized: "Ana", local_inspection_date: "2026-01-10", local_inspection_at: "09:00", completeness: "PARCIAL", metric_count: 4, modified_time: null, document_kind: "INSPECTION", exact_copy_of: "DOC-9" } },
      metrics: [],
    });
    expect(detail.inspection.uniqueness).toMatchObject({ exactCopyOf: "DOC-9", metricCount: 4, completeness: "PARCIAL" });
  });

  it("accepts a detail without the uniqueness block", () => {
    const detail = parseInspectionDetail({ inspection: inspection(), metrics: [] });
    expect(detail.inspection.uniqueness).toBeNull();
  });
});

function inspection() {
  return {
    id: "inspection-1", filename: "original.pdf", date: "2026-01-10", time: "09:00",
    technician: "Técnico A", auditor: "Auditor A", auditorRole: null, address: "Calle 1",
    city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10,
    actions: 0, rubric: "SYN", status: "COMPLETA", observation: null,
  };
}
