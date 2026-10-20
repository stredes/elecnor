import { describe, expect, it } from "vitest";
import { ListGuardedInspections } from "@/backend/application/guard/list-guarded-inspections";
import { parseInspectionList } from "@/backend/domain/inspection-list-parser";
import type { InspectionReader } from "@/backend/ports/inspection-reader";
import type { InspectionListQuery } from "@/backend/domain/inspection-list-contract";

const query: InspectionListQuery = {
  filters: { q: "", date: "", from: "", to: "", technician: "", auditor: "", region: "", status: "", score: "", month: "", sort: "date_desc" },
  limit: 1, offset: 0,
};

describe("guarded inspection list", () => {
  it("returns only official rows after resolving duplicates across pages", async () => {
    const rows = parseInspectionList({ data: [item("winner", "COMPLETA", "a"), item("loser", "PARCIAL", "b")], total: 2, limit: 2, offset: 0, dates: ["2026-10-19"], auditors: ["Luis"], regions: ["Norte"] }).data;
    const reader: InspectionReader = { list: async (request) => ({ data: rows.slice(request.offset, request.offset + request.limit), total: rows.length, limit: request.limit, offset: request.offset, dates: ["2026-10-19"], auditors: ["Luis"], regions: ["Norte"] }) };

    const result = await new ListGuardedInspections(reader).execute(query);

    expect(result.data.map((row) => row.id)).toEqual(["winner"]);
    expect(result.total).toBe(1);
    expect(result.guard.trays.excluded).toContain("loser");
  });
});

function item(id: string, status: "COMPLETA" | "PARCIAL", hash: string): Record<string, unknown> {
  return { id, date: "2026-10-19", time: "10:00", technician: "Ana", auditor: "Luis", address: "Calle 1", city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0, rubric: "RUBRICA", status, filename: `${id}.pdf`, document_id: `DOC-${id}`, provenance: { document_id: `DOC-${id}`, filename: `${id}.pdf`, sha256: hash.repeat(64), origin: "GOOGLE_DRIVE", date: "2026-10-19", time: "10:00" }, uniqueness: { sha256: hash.repeat(64), technician_normalized: "Ana", local_inspection_date: "2026-10-19", local_inspection_at: "10:00", completeness: status, metric_count: 3, modified_time: `2026-10-19T10:00:00Z`, document_kind: "INSPECTION", exact_copy_of: null } };
}
