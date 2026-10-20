import { describe, expect, it } from "vitest";
import { evaluateInspection } from "@/backend/domain/guard/guard-evaluate";
import { factsFromListItem } from "@/backend/domain/guard/guard-facts-mapper";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import { reasonCodes } from "@/backend/domain/guard/guard-reason";
import { COMPUTED_AT, listItem, ONE_METRIC } from "../domain/guard/guard-fixtures";

describe("guard contract with real-shaped facts and ambiguous cases", () => {
  it("accepts a real FastAPI-shaped inspection once facts are complete", () => {
    const item = listItem();
    const result = evaluateInspection(
      factsFromListItem(item, { ...ONE_METRIC, timezone: "Europe/Madrid", documentKind: "INSPECTION", datePrecision: "day", timePrecision: "minute" }),
      COMPUTED_AT,
    );
    expect(result.verdict).toBe("OK");
    expect(result.reasons).toHaveLength(0);
  });

  it("never infers the year for a partial date", () => {
    const result = evaluateInspection(
      factsFromListItem(listItem({ date: "2026-03", time: null }), { ...ONE_METRIC, documentKind: "INSPECTION", timezone: "Europe/Madrid" }),
      COMPUTED_AT,
    );
    expect(reasonCodes(result.reasons)).toContain("DATE_PARTIAL");
    expect(result.reasons.find((reason) => reason.code === "DATE_PARTIAL")?.evidence).toContain("2026-03");
    expect(result.verdict).toBe("WARNING");
  });

  it("flags missing timezone in list mode as INFO (not evaluable in list)", () => {
    const result = evaluateInspection(
      factsFromListItem(listItem({ time: "09:00" }), { ...ONE_METRIC, documentKind: "INSPECTION" }),
      COMPUTED_AT,
    );
    const reason = result.reasons.find((entry) => entry.code === "TIMEZONE_NOT_IN_LIST");
    expect(reason).toBeDefined();
    expect(reason?.severity).toBe("INFO");
    expect(reason?.evidence).toContain("no provista en listado");
  });

  it("keeps INFO reasons out of the official listing under the default policy", () => {
    const result = evaluateInspection(factsFromListItem(listItem({ time: "09:00" }), { ...ONE_METRIC, documentKind: "INSPECTION" }), COMPUTED_AT, DEFAULT_GUARD_POLICY);
    expect(result.verdict).toBe("OK");
    expect(result.official).toBe(true);
    expect(result.tray).toBe("OFFICIAL");
  });

  it("excludes non-inspection documents from the product", () => {
    const result = evaluateInspection(factsFromListItem(listItem(), { ...ONE_METRIC, documentKind: "OTHER" }), COMPUTED_AT);
    expect(result).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED" });
  });
});
