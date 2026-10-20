import { GUARD_RULE_VERSION } from "./guard-contract";

export type GuardSeverityChoice = "WARNING" | "BLOCKED";
export const UNIQUENESS_SCOPE = "technician_per_local_day";

export type GuardUniquenessScope = typeof UNIQUENESS_SCOPE;

export type GuardPolicy = {
  readonly ruleVersion: string;
  readonly uniquenessScope: GuardUniquenessScope;
  readonly partialDateSeverity: GuardSeverityChoice;
  readonly ambiguousDateSeverity: GuardSeverityChoice;
  readonly scoreOverMaxSeverity: GuardSeverityChoice;
  readonly warningsInOfficialKpi: boolean;
};

export const DEFAULT_GUARD_POLICY: GuardPolicy = {
  ruleVersion: GUARD_RULE_VERSION,
  uniquenessScope: UNIQUENESS_SCOPE,
  partialDateSeverity: "WARNING",
  ambiguousDateSeverity: "BLOCKED",
  scoreOverMaxSeverity: "BLOCKED",
  warningsInOfficialKpi: false,
};
