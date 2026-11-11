import { describe, expect, it } from "vitest";
import { parseInspectionQuery } from "@/backend/domain/inspection-list-query";
import { selectInspectionList } from "@/backend/domain/inspection-list-selection";
import type { InspectionListItem } from "@/backend/domain/inspection-list-contract";

const rows: InspectionListItem[] = [
  row("zeta", "2026-03-01", "Zoe", "Zoe", "PARCIAL", 100, "ALTURA"),
  row("alpha", "2026-01-01", "Álvaro", "Ana", "COMPLETA", 9, "PREPARACION"),
  row("beta", "2026-02-01", "Beto", "Luis", "COMPLETA", 80, "PISO"),
  row("missing", null, null, null, null, null, "SIN_CLASIFICAR"),
];

function ordered(sort: string): string[] {
  return selectInspectionList(rows, parseInspectionQuery({ sort, limit: "10" })).data.map((item) => item.id);
}

describe("inspection list sorting", () => {
  it("orders alphabetical columns in both directions and keeps empty values last", () => {
    expect(ordered("technician_asc")).toEqual(["alpha", "beta", "zeta", "missing"]);
    expect(ordered("auditor_desc")).toEqual(["zeta", "beta", "alpha", "missing"]);
    expect(ordered("status_asc")).toEqual(["alpha", "beta", "zeta", "missing"]);
  });

  it("orders context by the labels shown in the table", () => {
    expect(ordered("work_context_asc")).toEqual(["alpha", "beta", "missing", "zeta"]);
    expect(ordered("work_context_desc")).toEqual(["zeta", "missing", "beta", "alpha"]);
  });

  it("orders dates chronologically and scores numerically in both directions", () => {
    expect(ordered("date_asc")).toEqual(["alpha", "beta", "zeta", "missing"]);
    expect(ordered("date_desc")).toEqual(["zeta", "beta", "alpha", "missing"]);
    expect(ordered("score_asc")).toEqual(["alpha", "beta", "zeta", "missing"]);
    expect(ordered("score_desc")).toEqual(["zeta", "beta", "alpha", "missing"]);
  });
});

function row(
  id: string,
  date: string | null,
  technician: string | null,
  auditor: string | null,
  status: string | null,
  percentage: number | null,
  workContext: InspectionListItem["workContext"],
): InspectionListItem {
  return {
    id, date, time: null, technician, auditor, address: null, city: null, region: null,
    percentage, score: null, maxScore: null, actions: null, rubric: null, status, filename: null,
    workContext,
  };
}
