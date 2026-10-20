import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardTray, GuardVerdict, GuardVerdictResult } from "./guard-contract";
import { DEFAULT_GUARD_POLICY, type GuardPolicy } from "./guard-policy";
import { hasSeverity, sortReasons } from "./guard-reason";
import { identityReasons } from "./guard-rules-identity";
import { dateReasons, timeReasons } from "./guard-rules-date";
import { documentKindReasons, provenanceReasons } from "./guard-rules-document";
import { exactCopyReasons, hasExactCopy } from "./guard-rules-exact-copy";
import { metricReasons } from "./guard-rules-metrics";
import { completenessReasons, isPartial, statusReasons } from "./guard-rules-completeness";

export function evaluateInspection(
  facts: InspectionFacts,
  computedAt: string,
  policy: GuardPolicy = DEFAULT_GUARD_POLICY,
): GuardVerdictResult {
  const reasons = sortReasons([
    ...identityReasons(facts, policy, computedAt),
    ...dateReasons(facts, policy, computedAt),
    ...timeReasons(facts, policy, computedAt),
    ...provenanceReasons(facts, policy, computedAt),
    ...documentKindReasons(facts, policy, computedAt),
    ...exactCopyReasons(facts, policy, computedAt),
    ...metricReasons(facts, policy, computedAt),
    ...completenessReasons(facts, policy, computedAt),
    ...statusReasons(facts, policy, computedAt),
  ]);
  const verdict = verdictOf(facts, reasons);
  const tray = trayOf(facts, verdict, policy);
  return {
    inspectionId: facts.inspectionId,
    verdict,
    tray,
    official: tray === "OFFICIAL",
    officialWithWarning: tray === "OFFICIAL" && verdict === "WARNING",
    reasons,
    ruleVersion: policy.ruleVersion,
    computedAt,
  };
}

function verdictOf(facts: InspectionFacts, reasons: Parameters<typeof hasSeverity>[0]): GuardVerdict {
  if (isExcluded(facts)) return "EXCLUDED";
  if (hasSeverity(reasons, "BLOCKED")) return "BLOCKED";
  if (hasSeverity(reasons, "WARNING")) return "WARNING";
  return "OK";
}

function isExcluded(facts: InspectionFacts): boolean {
  if (facts.documentKind !== null && facts.documentKind !== "INSPECTION") return true;
  return hasExactCopy(facts);
}

function trayOf(facts: InspectionFacts, verdict: GuardVerdict, policy: GuardPolicy): GuardTray {
  if (verdict === "EXCLUDED") return "EXCLUDED";
  if (verdict === "BLOCKED") return "BLOCKED";
  if (isPartial(facts)) return "PENDING";
  if (verdict === "WARNING") return policy.warningsInOfficialKpi ? "OFFICIAL" : "OBSERVATION";
  return "OFFICIAL";
}
