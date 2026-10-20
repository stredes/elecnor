import { describe, expect, it } from "vitest";
import type { InspectionFacts } from "@/backend/domain/guard/guard-facts-contract";
import { DEFAULT_GUARD_POLICY } from "@/backend/domain/guard/guard-policy";
import { evaluateGuardedSet } from "@/backend/domain/guard/guard-uniqueness";
import { COMPUTED_AT, facts, OTHER_HASH } from "./guard-fixtures";

const byId = (list: readonly InspectionFacts[]) =>
  new Map(evaluateGuardedSet(list, COMPUTED_AT, DEFAULT_GUARD_POLICY).map((verdict) => [verdict.inspectionId, verdict]));

const technicianDay = { technicianNormalized: "Ana", localInspectionDate: "2026-01-10" };
const distinctSha = { sha256: OTHER_HASH, sha256Recalculated: OTHER_HASH };

describe("guard uniqueness precedence is deterministic", () => {
  it("prefers the larger metric count when both are complete", () => {
    const fewer = facts({ ...technicianDay, inspectionId: "INS-FEW", documentId: "DOC-FEW", metricCount: 2 });
    const more = facts({ ...technicianDay, inspectionId: "INS-MORE", documentId: "DOC-MORE", metricCount: 9, provenance: distinctSha });
    expect(byId([fewer, more]).get("INS-MORE")?.verdict).toBe("OK");
    expect(byId([fewer, more]).get("INS-FEW")?.verdict).toBe("EXCLUDED");
  });

  it("prefers the most recent local time when completeness and metric count tie", () => {
    const early = facts({ ...technicianDay, inspectionId: "INS-EARLY", documentId: "DOC-EARLY", localInspectionAt: "08:00" });
    const late = facts({ ...technicianDay, inspectionId: "INS-LATE", documentId: "DOC-LATE", localInspectionAt: "17:30", provenance: distinctSha });
    expect(byId([early, late]).get("INS-LATE")?.verdict).toBe("OK");
    expect(byId([early, late]).get("INS-EARLY")?.verdict).toBe("EXCLUDED");
  });

  it("breaks an exact tie by document id, independent of arrival order", () => {
    const lower = facts({ ...technicianDay, inspectionId: "INS-Y", documentId: "DOC-A", localInspectionAt: "09:00" });
    const higher = facts({ ...technicianDay, inspectionId: "INS-X", documentId: "DOC-B", localInspectionAt: "09:00", provenance: distinctSha });
    const forward = byId([lower, higher]);
    const reversed = byId([higher, lower]);
    expect(forward.get("INS-Y")?.verdict).toBe("OK");
    expect(forward.get("INS-X")?.verdict).toBe("EXCLUDED");
    expect(reversed.get("INS-Y")?.verdict).toBe("OK");
    expect(reversed.get("INS-X")?.verdict).toBe("EXCLUDED");
    expect(reversed.get("INS-X")?.reasons.map((reason) => reason.code)).toEqual(forward.get("INS-X")?.reasons.map((reason) => reason.code));
  });
});
