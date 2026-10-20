import { describe, expect, it } from "vitest";
import { evaluateInspection } from "@/backend/domain/guard/guard-evaluate";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import { reasonCodes } from "@/backend/domain/guard/guard-reason";
import { COMPUTED_AT, facts, OTHER_HASH } from "./guard-fixtures";

function evaluate(patch = {}, computedAt = COMPUTED_AT, policy = DEFAULT_GUARD_POLICY) {
  return evaluateInspection(facts(patch), computedAt, policy);
}

describe("guard P0 rule matrix: one proof per reason code", () => {
  const cases: readonly [string, Parameters<typeof evaluate>[0], string][] = [
    ["TECHNICIAN_MISSING", { technicianNormalized: "" }, "BLOCKED"],
    ["DATE_MISSING", { localInspectionDate: null, timestampRaw: null }, "BLOCKED"],
    ["DATE_PARTIAL", { localInspectionDate: "2026-03", datePrecision: "month" }, "WARNING"],
    ["DATE_AMBIGUOUS", { localInspectionDate: null, datePrecision: null }, "BLOCKED"],
    ["TIME_INVALID", { localInspectionAt: "25:99" }, "WARNING"],
    ["TIMEZONE_UNKNOWN", { timezone: null }, "WARNING"],
    ["PROVENANCE_INCOMPLETE", { provenance: { present: false, filename: null, sha256: null } }, "BLOCKED"],
    ["SHA_MISMATCH", { provenance: { sha256Recalculated: OTHER_HASH } }, "BLOCKED"],
    ["DUPLICATE_EXACT_COPY", { exactCopyOf: "DOC-2" }, "INFO"],
    ["DOCUMENT_KIND_NOT_INSPECTION", { documentKind: "TEMPLATE" }, "INFO"],
    ["METRIC_SCORE_OVER_MAX", { metrics: [{ code: "EPP-01", section: "EPP", label: null, applicable: 1, conforming: 1, nonConforming: 0, score: 12, maxScore: 10, percentage: 80 }] }, "BLOCKED"],
    ["METRIC_PERCENTAGE_OUT_OF_RANGE", { metrics: [{ code: "EPP-01", section: "EPP", label: null, applicable: 1, conforming: 1, nonConforming: 0, score: 8, maxScore: 10, percentage: 140 }] }, "WARNING"],
    ["METRIC_MISSING_CODE", { metrics: [{ code: null, section: "EPP", label: null, applicable: null, conforming: null, nonConforming: null, score: null, maxScore: null, percentage: null }] }, "BLOCKED"],
    ["METRIC_DUPLICATED", { metrics: [{ code: "EPP-01", section: "EPP", label: null, applicable: 1, conforming: 1, nonConforming: 0, score: 1, maxScore: 10, percentage: 50 }, { code: "EPP-01", section: "EPP", label: null, applicable: 1, conforming: 1, nonConforming: 0, score: 1, maxScore: 10, percentage: 50 }] }, "WARNING"],
    ["RUBRIC_EMPTY", { rubric: "" }, "WARNING"],
    ["SECTIONS_EMPTY", { sections: [{ name: "EPP", metricCount: 0 }] }, "WARNING"],
    ["NO_METRICS", { metrics: [], metricCount: 0 }, "BLOCKED"],
    ["PARTIAL_STATUS_PENDING", { importStatus: "PARCIAL" }, "INFO"],
  ];

  for (const [code, patch, severity] of cases) {
    it(`reports ${code} with severity ${severity}`, () => {
      const result = evaluate(patch);
      expect(reasonCodes(result.reasons)).toContain(code);
      expect(result.reasons.find((reason) => reason.code === code)?.severity).toBe(severity);
    });
  }
});

describe("guard P0 rule matrix: one proof per verdict", () => {
  it("OK when every rule passes", () => {
    const result = evaluate();
    expect(result.verdict).toBe("OK");
    expect(result.tray).toBe("OFFICIAL");
    expect(result.official).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("WARNING with visible mark and outside KPI by default", () => {
    const result = evaluate({ rubric: "" });
    expect(result.verdict).toBe("WARNING");
    expect(result.tray).toBe("OBSERVATION");
    expect(result.official).toBe(false);
  });

  it("BLOCKED keeps the item in the review tray", () => {
    const result = evaluate({ technicianNormalized: "" });
    expect(result.verdict).toBe("BLOCKED");
    expect(result.tray).toBe("BLOCKED");
  });

  it("EXCLUDED for template documents and exact copies", () => {
    expect(evaluate({ documentKind: "TEMPLATE" })).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED" });
    expect(evaluate({ exactCopyOf: "DOC-2" })).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED" });
  });

  it("PARTIAL is preserved as pending and never becomes complete", () => {
    const result = evaluate({ importStatus: "PARCIAL" });
    expect(result.tray).toBe("PENDING");
    expect(result.official).toBe(false);
    expect(reasonCodes(result.reasons)).toContain("PARTIAL_STATUS_PENDING");
  });
});

describe("guard policy toggles are explicit, never fixed thresholds", () => {
  it("promotes partial dates to BLOCKED when the policy says so", () => {
    const result = evaluate({ localInspectionDate: "2026", datePrecision: "year" }, COMPUTED_AT, { ...DEFAULT_GUARD_POLICY, partialDateSeverity: "BLOCKED" });
    expect(result.verdict).toBe("BLOCKED");
  });

  it("only admits WARNING into the official listing when the policy authorizes it", () => {
    const result = evaluate({ rubric: "" }, COMPUTED_AT, { ...DEFAULT_GUARD_POLICY, warningsInOfficialKpi: true });
    expect(result).toMatchObject({ verdict: "WARNING", tray: "OFFICIAL", official: true, officialWithWarning: true });
  });
});
