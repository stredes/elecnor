import { describe, expect, it } from "vitest";
import { InspectionListContractError, parseInspectionList } from "@/backend/domain/inspection-list-parser";
import { factsFromListItem } from "@/backend/domain/guard/guard-facts-mapper";
import { evaluateGuardedSet } from "@/backend/domain/guard/guard-uniqueness";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import { COMPUTED_AT } from "./guard-fixtures";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

describe("inspection list parser accepts the real FastAPI uniqueness block", () => {
  it("maps every uniqueness fact into the stage-2 guard facts", () => {
    const list = parseInspectionList(page([item("INS-A", SHA_A, { local_inspection_at: "10:00", metric_count: 10 })]));
    const facts = factsFromListItem(list.data[0]);
    expect(list.data[0].uniqueness).toMatchObject({ sha256: SHA_A, technicianNormalized: "Ana", metricCount: 10, documentKind: "INSPECTION" });
    expect(facts).toMatchObject({
      technicianNormalized: "ana", localInspectionDate: "2026-10-19", localInspectionAt: "10:00",
      importStatus: "COMPLETA", metricCount: 10, exactCopyOf: null,
    });
    expect(facts.provenance.sha256).toBe(SHA_A);
  });

  it("keeps an exact copy addressable by document id and excludes it", () => {
    const list = parseInspectionList(page([item("INS-C", SHA_A, { exact_copy_of: "DOC-1" })]));
    expect(list.data[0].uniqueness?.exactCopyOf).toBe("DOC-1");
    const facts = list.data.map((row) => factsFromListItem(row));
    const verdict = evaluateGuardedSet(facts, COMPUTED_AT, DEFAULT_GUARD_POLICY)[0];
    expect(verdict).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED", official: false });
    expect(verdict.reasons.map((reason) => reason.code)).toContain("DUPLICATE_EXACT_COPY");
  });

  it("accepts items without the uniqueness block and with a null block", () => {
    const bare = { ...item("INS-X", SHA_A), uniqueness: undefined };
    const list = parseInspectionList(page([bare, { ...item("INS-Y", SHA_A), uniqueness: null }]));
    expect(list.data[0].uniqueness ?? null).toBeNull();
    expect(list.data[1].uniqueness).toBeNull();
    expect(factsFromListItem(list.data[0]).provenance.sha256).toBe(SHA_A);
  });

  it("accepts unknown uniqueness fields but rejects malformed sha256", () => {
    const list = parseInspectionList(page([{ ...item("INS-Z", SHA_A), uniqueness: { ...uniqueness(SHA_A), extra: 1 } }]));
    expect(list.data[0].uniqueness).toBeDefined();
    expect(() => parseInspectionList(page([{ ...item("INS-Z", SHA_A), uniqueness: { ...uniqueness(SHA_A), sha256: "not-a-hash" } }]))).toThrow(InspectionListContractError);
  });

  it("preserves non-inspection document kinds for the all-data scope", () => {
    const list = parseInspectionList(page([item("INS-T", SHA_A, { document_kind: "TEMPLATE" })]));
    expect(list.data[0].uniqueness?.documentKind).toBe("TEMPLATE");
  });
});

describe("guard resolves the four synthetic documents from real uniqueness facts", () => {
  it("excludes the exact copy and keeps a single winner per technician/day", () => {
    const list = parseInspectionList(page([
      item("INS-A", SHA_A, { local_inspection_at: "10:00", metric_count: 10 }),
      item("INS-B", SHA_B, { local_inspection_at: "17:30", metric_count: 4 }),
      item("INS-C", SHA_A, { local_inspection_at: "10:00", metric_count: 10, exact_copy_of: "DOC-1" }),
      item("INS-D", "c".repeat(64), { local_inspection_at: "12:00", metric_count: 10 }),
    ]));
    const verdicts = evaluateGuardedSet(list.data.map((row) => factsFromListItem(row)), COMPUTED_AT, DEFAULT_GUARD_POLICY);
    const byId = new Map(verdicts.map((verdict) => [verdict.inspectionId, verdict]));
    expect(byId.get("INS-C")?.reasons.map((reason) => reason.code)).toContain("DUPLICATE_EXACT_COPY");
    const winner = verdicts.find((verdict) => verdict.verdict !== "EXCLUDED");
    expect(winner?.inspectionId).toBe("INS-D");
    expect(winner?.official).toBe(true);
    expect(winner?.verdict).toBe("OK");
  });
});

function item(id: string, sha256: string, patch: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id, date: "2026-10-19", time: null, technician: "Ana", auditor: "Luis", address: "Calle 1",
    city: "Ciudad", region: "Norte", percentage: 80, score: 8, maxScore: 10, actions: 0,
    rubric: "RUBRICA", status: "COMPLETA", filename: `${id}.pdf`, document_id: `DOC-${id}`,
    provenance: { document_id: `DOC-${id}`, filename: `${id}.pdf`, sha256, origin: "GOOGLE_DRIVE", date: "2026-10-19", time: "10:00" },
    uniqueness: { ...uniqueness(sha256), ...patch },
  };
}

function uniqueness(sha256: string): Record<string, unknown> {
  return {
    sha256, technician_normalized: "Ana", local_inspection_date: "2026-10-19", local_inspection_at: "09:00",
    completeness: "COMPLETA", metric_count: 3, modified_time: "2026-10-19T09:00:00Z",
    document_kind: "INSPECTION", exact_copy_of: null,
  };
}

function page(data: readonly unknown[]): Record<string, unknown> {
  return { data, total: data.length, limit: 25, offset: 0, dates: [], auditors: [], regions: [] };
}
