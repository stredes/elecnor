import type { GuardReason, GuardReasonCode, GuardSeverity } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";

const RANK: Record<GuardSeverity, number> = { INFO: 1, WARNING: 2, BLOCKED: 3 };

export function guardReason(
  code: GuardReasonCode,
  severity: GuardSeverity,
  field: string,
  evidence: string,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason {
  return { code, severity, field, evidence, ruleVersion: policy.ruleVersion, computedAt };
}

export function sortReasons(reasons: readonly GuardReason[]): readonly GuardReason[] {
  return [...reasons].sort(
    (left, right) =>
      left.code.localeCompare(right.code) ||
      left.field.localeCompare(right.field) ||
      left.evidence.localeCompare(right.evidence),
  );
}

export function hasSeverity(reasons: readonly GuardReason[], severity: GuardSeverity): boolean {
  return reasons.some((reason) => RANK[reason.severity] >= RANK[severity]);
}

export function reasonCodes(reasons: readonly GuardReason[]): readonly string[] {
  return reasons.map((reason) => reason.code);
}
