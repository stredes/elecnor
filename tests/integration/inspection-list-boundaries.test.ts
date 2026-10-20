import { describe, expect, it } from "vitest";
import {
  buildInspectionQuery,
  parseInspectionQuery,
} from "@/backend/domain/inspection-list-query";
import { parseInspectionList } from "@/backend/domain/inspection-list-parser";
import type { InspectionListItem } from "@/backend/domain/inspection-list-contract";
import { selectInspectionList } from "@/backend/domain/inspection-list-selection";

describe("NP-0030/AC-02/TEST-02 inspection list boundaries", () => {
  it("defaults malformed values and rejects unsupported filters", () => {
    const query = parseInspectionQuery({
      limit: "25px", offset: "1x", score: "1to2", status: "DROP TABLE", sort: "id_desc",
    });
    expect(query.limit).toBe(500);
    expect(query.offset).toBe(0);
    expect(query.filters.score).toBe("");
    expect(query.filters.status).toBe("");
    expect(query.filters.sort).toBe("date_desc");
  });

  it("keeps missing values last and encodes search as data", () => {
    const query = parseInspectionQuery({ sort: "date_desc", limit: "2" });
    const result = selectInspectionList([
      row("missing", null, null), row("dated", "2026-01-01", 40),
    ], query);
    expect(result.data.map((item) => item.id)).toEqual(["dated", "missing"]);
    const unsafe = parseInspectionQuery({ q: "x' OR 1=1", limit: "2" });
    expect(buildInspectionQuery(unsafe)).toContain("q=x%27+OR+1%3D1");
    expect(buildInspectionQuery(unsafe)).toContain("scope=official");
  });

  it("preserves a missing processing status from the all-data scope", () => {
    const result = parseInspectionList({
      data: [{ id: "missing-status", date: null, time: null, technician: null, auditor: null, address: null, city: null, region: null,
        percentage: null, score: null, maxScore: null, actions: null, rubric: null, status: null, filename: null }],
      total: 1, limit: 25, offset: 0, dates: [], auditors: [], regions: [],
    });
    expect(result.data[0].status).toBeNull();
  });

  it("parses and transports the work-context filter", () => {
    const query = parseInspectionQuery({ work_context: "ALTURA", limit: "2" });
    const result = selectInspectionList([
      { ...row("floor", "2026-01-01", 80), workContext: "PISO" },
      { ...row("height", "2026-01-02", 80), workContext: "ALTURA" },
    ], query);
    expect(query.filters.workContext).toBe("ALTURA");
    expect(result.data.map((item) => item.id)).toEqual(["height"]);
    expect(buildInspectionQuery(query)).toContain("work_context=ALTURA");
  });
});

function row(id: string, date: string | null, percentage: number | null): InspectionListItem {
  return {
    id, date, percentage, time: null, technician: null, auditor: null, address: null,
    city: null, region: null, score: null, maxScore: null, actions: null, rubric: null,
    status: "COMPLETA", filename: null,
  };
}
