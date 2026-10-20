import { describe, expect, it } from "vitest";
import { evaluateInspection } from "@/backend/domain/guard/guard-evaluate";
import { GUARD_RULE_VERSION } from "@/backend/domain/guard/guard-contract";
import { reasonCodes } from "@/backend/domain/guard/guard-reason";
import { COMPUTED_AT, facts } from "./guard-fixtures";

const SAMPLE = facts({ rubric: "" });

describe("guard determinism and idempotency", () => {
  it("returns the same verdict for the same facts and timestamp", () => {
    expect(evaluateInspection(SAMPLE, COMPUTED_AT)).toEqual(evaluateInspection(SAMPLE, COMPUTED_AT));
  });

  it("keeps verdict, tray and reasons stable regardless of computed_at (no server clock leak)", () => {
    const first = evaluateInspection(SAMPLE, "2026-10-19T12:00:00.000Z");
    const second = evaluateInspection(SAMPLE, "2030-01-01T00:00:00.000Z");
    expect(second.verdict).toBe(first.verdict);
    expect(second.tray).toBe(first.tray);
    expect(reasonCodes(second.reasons)).toEqual(reasonCodes(first.reasons));
    expect(second.reasons.map((reason) => reason.field)).toEqual(first.reasons.map((reason) => reason.field));
  });

  it("serializes reasons in a stable, sorted order", () => {
    const codes = reasonCodes(evaluateInspection(SAMPLE, COMPUTED_AT).reasons);
    expect(codes).toEqual([...codes].sort());
  });

  it("stamps the versioned rule id on every verdict and reason", () => {
    const result = evaluateInspection(SAMPLE, COMPUTED_AT);
    expect(result.ruleVersion).toBe(GUARD_RULE_VERSION);
    expect(result.reasons.every((reason) => reason.ruleVersion === GUARD_RULE_VERSION)).toBe(true);
  });
});
