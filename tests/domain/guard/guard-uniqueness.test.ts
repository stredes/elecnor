import { describe, expect, it } from "vitest";
import type { InspectionFacts } from "@/backend/domain/guard/guard-facts-contract";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import { evaluateGuardedSet } from "@/backend/domain/guard/guard-uniqueness";
import { COMPUTED_AT, facts, OTHER_HASH } from "./guard-fixtures";

const run = (list: readonly InspectionFacts[], policy = DEFAULT_GUARD_POLICY) =>
  evaluateGuardedSet(list, COMPUTED_AT, policy);

const byId = (list: readonly InspectionFacts[]) =>
  new Map(run(list).map((verdict) => [verdict.inspectionId, verdict]));

const distinctSha = { sha256: OTHER_HASH, sha256Recalculated: OTHER_HASH };

describe("guard uniqueness: one valid inspection per technician and local day", () => {
  it("EXCLUDES an exact copy identified by SHA-256 provenance", () => {
    const copy = facts({ inspectionId: "INS-COPY", documentId: "DOC-COPY", exactCopyOf: "DOC-1" });
    const verdict = run([copy])[0];
    expect(verdict).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED", official: false });
    expect(verdict.reasons.map((reason) => reason.code)).toContain("DUPLICATE_EXACT_COPY");
    expect(verdict.reasons.find((reason) => reason.code === "DUPLICATE_EXACT_COPY")?.evidence).toContain("exact_copy_of=DOC-1");
  });

  it("resolves same technician and day automatically: COMPLETA beats PARCIAL", () => {
    const complete = facts({ inspectionId: "INS-A", documentId: "DOC-A", technicianNormalized: "Ana", localInspectionDate: "2026-01-10", localInspectionAt: "08:00" });
    const partial = facts({ inspectionId: "INS-B", documentId: "DOC-B", technicianNormalized: "Ana", localInspectionDate: "2026-01-10", localInspectionAt: "18:00", importStatus: "PARCIAL", provenance: distinctSha });
    const results = byId([partial, complete]);
    expect(results.get("INS-A")).toMatchObject({ verdict: "OK", tray: "OFFICIAL", official: true });
    const loser = results.get("INS-B");
    expect(loser).toMatchObject({ verdict: "EXCLUDED", tray: "EXCLUDED", official: false });
    expect(loser?.reasons.map((reason) => reason.code)).toContain("DUPLICATE_SAME_TECHNICIAN_DAY");
    expect(loser?.reasons.find((reason) => reason.code === "DUPLICATE_SAME_TECHNICIAN_DAY")?.evidence).toContain("ganador=DOC-A");
  });

  it("keeps both inspections when the same technician works on different days", () => {
    const first = facts({ inspectionId: "INS-A", documentId: "DOC-A", technicianNormalized: "Ana", localInspectionDate: "2026-01-10" });
    const second = facts({ inspectionId: "INS-B", documentId: "DOC-B", technicianNormalized: "Ana", localInspectionDate: "2026-01-11", provenance: distinctSha });
    const results = byId([first, second]);
    expect(results.get("INS-A")?.verdict).toBe("OK");
    expect(results.get("INS-B")?.verdict).toBe("OK");
  });

  it("keeps both inspections when different technicians share the day and auditor", () => {
    const first = facts({ inspectionId: "INS-A", documentId: "DOC-A", technicianNormalized: "Ana", auditor: "Auditor X", localInspectionDate: "2026-01-10" });
    const second = facts({ inspectionId: "INS-B", documentId: "DOC-B", technicianNormalized: "Bruno", auditor: "Auditor A", localInspectionDate: "2026-01-10", provenance: distinctSha });
    const results = byId([first, second]);
    expect(results.get("INS-A")?.verdict).toBe("OK");
    expect(results.get("INS-B")?.verdict).toBe("OK");
  });
});
