import { describe, expect, it } from "vitest";
import { guardInspectionPage } from "@/backend/application/guard/guard-inspection-page";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import type { InspectionListResult } from "@/backend/domain/inspection-list-contract";
import type { InspectionFactsPatch } from "@/backend/domain/guard/guard-facts-contract";
import { COMPUTED_AT, listItem, ONE_METRIC, OTHER_HASH } from "../domain/guard/guard-fixtures";

const patch = (extra: InspectionFactsPatch = {}): InspectionFactsPatch => ({ ...ONE_METRIC, timezone: "Europe/Madrid", documentKind: "INSPECTION", ...extra });
const list: InspectionListResult = {
  data: [
    listItem({ id: "official-ok" }),
    listItem({ id: "observation", rubric: "", date: "2026-01-11" }),
    listItem({ id: "blocked", technician: "" }),
    listItem({ id: "pending-partial", date: "2026-02-01", status: "PARCIAL" }),
    listItem({ id: "same-day-loser", date: "2026-01-10", status: "PARCIAL" }),
    listItem({ id: "exact-copy" }),
    listItem({ id: "template" }),
  ],
  total: 7,
  limit: 25,
  offset: 0,
  dates: ["2026-01-10"],
  auditors: ["Luis Gómez"],
  regions: ["Norte"],
};

const patches: Readonly<Record<string, InspectionFactsPatch>> = {
  "official-ok": patch(),
  observation: patch(),
  blocked: patch(),
  "pending-partial": patch(),
  "same-day-loser": patch({ provenance: { sha256: OTHER_HASH } }),
  "exact-copy": patch({ exactCopyOf: "DOC-1" }),
  template: patch({ documentKind: "TEMPLATE" }),
};

describe("guarded read model gating", () => {
  it("keeps only OK in the official listing and resolves same technician/day by precedence", () => {
    const gating = guardInspectionPage({ list, computedAt: COMPUTED_AT, patches });
    expect(gating.scope).toBe("page");
    expect(gating.uniquenessScope).toBe("technician_per_local_day");
    expect(gating.trays.official).toEqual(["official-ok"]);
    expect(gating.kpi).toEqual({ official: 1, warningsIncluded: 0, outOfKpi: 6 });
    expect(gating.trays.observations).toEqual(["observation"]);
    expect(gating.trays.blocked).toEqual(["blocked"]);
    expect(gating.trays.pending).toEqual(["pending-partial"]);
    expect(gating.trays.excluded).toEqual(["same-day-loser", "exact-copy", "template"]);
  });

  it("keeps the loser traceable to the winner without exposing a duplicates tray", () => {
    const gating = guardInspectionPage({ list, computedAt: COMPUTED_AT, patches });
    const loser = gating.verdicts.find((verdict) => verdict.inspectionId === "same-day-loser");
    expect(loser).toMatchObject({ verdict: "EXCLUDED", official: false });
    expect(loser?.reasons.map((reason) => reason.code)).toContain("DUPLICATE_SAME_TECHNICIAN_DAY");
    expect(loser?.reasons.find((reason) => reason.code === "DUPLICATE_SAME_TECHNICIAN_DAY")?.evidence).toContain("ganador=DOC-1");
    expect(gating).not.toHaveProperty("trays.duplicates");
  });

  it("admits WARNING into official only when the policy authorizes it, with a visible mark", () => {
    const gating = guardInspectionPage({ list, computedAt: COMPUTED_AT, patches, policy: { ...DEFAULT_GUARD_POLICY, warningsInOfficialKpi: true } });
    expect(gating.kpi).toEqual({ official: 2, warningsIncluded: 1, outOfKpi: 5 });
    expect(gating.trays.official).toEqual(["official-ok", "observation"]);
    expect(gating.verdicts.find((verdict) => verdict.inspectionId === "observation")?.officialWithWarning).toBe(true);
  });

  it("never exposes drive identifiers or tokens in the guarded output", () => {
    const serialized = JSON.stringify(guardInspectionPage({ list, computedAt: COMPUTED_AT, patches }));
    expect(serialized).not.toContain("drive_file_id");
    expect(serialized).not.toContain("webContentLink");
    expect(serialized).not.toContain("google.com");
  });
});
