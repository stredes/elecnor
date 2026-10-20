import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

export function provenanceReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const reasons: GuardReason[] = [];
  const provenance = facts.provenance;
  if (!provenance.present || !provenance.filename || !provenance.sha256) {
    const severity = facts.evaluationMode === "list" ? "INFO" : "BLOCKED";
    const code = facts.evaluationMode === "list" ? "PROVENANCE_INCOMPLETE_IN_LIST" : "PROVENANCE_INCOMPLETE";
    reasons.push(
      guardReason(
        code,
        severity,
        "provenance",
        `filename=${provenance.filename ?? "null"}; sha256=${provenance.sha256 ?? "null"}; present=${provenance.present}`,
        policy,
        computedAt,
      ),
    );
  }
  if (mismatch(provenance.sha256, provenance.sha256Recalculated)) {
    reasons.push(
      guardReason(
        "SHA_MISMATCH",
        "BLOCKED",
        "provenance.sha256",
        `registrado=${provenance.sha256}; recalculado=${provenance.sha256Recalculated}`,
        policy,
        computedAt,
      ),
    );
  }
  return reasons;
}

export function documentKindReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const kind = facts.documentKind;
  if (kind === null || kind === "INSPECTION") return [];
  return [
    guardReason("DOCUMENT_KIND_NOT_INSPECTION", "INFO", "documentKind", `document_kind=${kind}`, policy, computedAt),
  ];
}

function mismatch(registered: string | null, recalculated: string | null): boolean {
  if (!registered || !recalculated) return false;
  return registered.toLowerCase() !== recalculated.toLowerCase();
}
