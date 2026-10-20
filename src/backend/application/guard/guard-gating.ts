import type { GuardTray, GuardVerdictResult } from "../../domain/guard/guard-contract";
import { GUARD_RULE_VERSION } from "../../domain/guard/guard-contract";
import { UNIQUENESS_SCOPE } from "../../domain/guard/guard-policy";
import type { GuardGating, GuardGatingCore } from "./guard-gating-contract";

export function buildGuardGating(verdicts: readonly GuardVerdictResult[]): GuardGatingCore {
  const trays: Record<GuardTray, string[]> = {
    OFFICIAL: [], PENDING: [], OBSERVATION: [], BLOCKED: [], EXCLUDED: [],
  };
  for (const verdict of verdicts) trays[verdict.tray].push(verdict.inspectionId);
  const official = trays.OFFICIAL.length;
  return {
    kpi: { official, warningsIncluded: verdicts.filter((v) => v.officialWithWarning).length, outOfKpi: verdicts.length - official },
    trays: {
      official: trays.OFFICIAL, pending: trays.PENDING, observations: trays.OBSERVATION,
      blocked: trays.BLOCKED, excluded: trays.EXCLUDED,
    },
  };
}

export function emptyGating(computedAt: string): GuardGating {
  return {
    ...buildGuardGating([]),
    scope: "page",
    ruleVersion: GUARD_RULE_VERSION,
    uniquenessScope: UNIQUENESS_SCOPE,
    computedAt,
    verdicts: [],
  };
}
