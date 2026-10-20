import { describe, expect, it } from "vitest";
import { guardInspectionPage } from "@/backend/application/guard/guard-inspection-page";
import { parseInspectionList } from "@/backend/domain/inspection-list-parser";
import type { InspectionListQuery } from "@/backend/domain/inspection-list-contract";
import { COMPUTED_AT } from "../domain/guard/guard-fixtures";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const SHA_D = "d".repeat(64);

const page = parseInspectionList({
  data: [
    item("INS-A", "DOC-A", SHA_A, 10, "10:00"),
    item("INS-B", "DOC-B", SHA_B, 4, "17:30"),
    item("INS-C", "DOC-C", SHA_A, 10, "10:00", "DOC-A"),
    item("INS-D", "DOC-D", SHA_D, 10, "12:00"),
  ],
  total: 4, limit: 25, offset: 0, dates: [], auditors: [], regions: [],
});

describe("acceptance: real uniqueness facts keep exactly one official inspection", () => {
  it("resolves the four synthetic documents with a coherent official KPI", () => {
    const gating = guardInspectionPage({ list: page, computedAt: COMPUTED_AT });
    expect(gating.uniquenessScope).toBe("technician_per_local_day");
    const byId = new Map(gating.verdicts.map((verdict) => [verdict.inspectionId, verdict]));
    expect(byId.get("INS-C")?.reasons.map((reason) => reason.code)).toContain("DUPLICATE_EXACT_COPY");
    expect(byId.get("INS-C")?.verdict).toBe("EXCLUDED");
    expect(byId.get("INS-D")?.verdict).not.toBe("EXCLUDED");
    const losers = ["INS-A", "INS-B", "INS-C"].filter((id) => byId.get(id)?.verdict === "EXCLUDED");
    expect(losers).toEqual(["INS-A", "INS-B", "INS-C"]);
    expect(byId.get("INS-B")?.reasons.find((reason) => reason.code === "DUPLICATE_SAME_TECHNICIAN_DAY")?.evidence).toContain("ganador=DOC-D");
    expect(gating.kpi.official).toBe(gating.verdicts.filter((verdict) => verdict.official).length);
    expect(gating.trays.official).not.toContain("INS-C");
  });
});

function item(id: string, documentId: string, sha256: string, metricCount: number, time: string, exactCopyOf: string | null = null): Record<string, unknown> {
  return {
    id, date: "2026-10-19", time: null, technician: "Ana", auditor: "Luis", address: "Calle 1",
    city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0,
    rubric: "RUBRICA", status: "COMPLETA", filename: `${id}.pdf`, document_id: documentId,
    provenance: { document_id: documentId, filename: `${id}.pdf`, sha256, origin: "GOOGLE_DRIVE", date: "2026-10-19", time },
    uniqueness: {
      sha256, technician_normalized: "Ana", local_inspection_date: "2026-10-19", local_inspection_at: time,
      completeness: "COMPLETA", metric_count: metricCount, modified_time: `2026-10-19T${time}:00Z`,
      document_kind: "INSPECTION", exact_copy_of: exactCopyOf,
    },
  };
}

export const acceptanceQuery: InspectionListQuery = {
  filters: { q: "", date: "", from: "", to: "", technician: "", auditor: "", region: "", status: "", score: "", month: "", sort: "date_desc" },
  limit: 25, offset: 0,
};
