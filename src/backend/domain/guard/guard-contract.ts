export const GUARD_RULE_VERSION = "np-0026-guard/2.0.0";

export type GuardVerdict = "OK" | "WARNING" | "BLOCKED" | "EXCLUDED";
export type GuardSeverity = "INFO" | "WARNING" | "BLOCKED";
export type GuardTray = "OFFICIAL" | "PENDING" | "OBSERVATION" | "BLOCKED" | "EXCLUDED";

export const GUARD_REASON_CODES = [
  "TECHNICIAN_MISSING",
  "DATE_MISSING",
  "DATE_PARTIAL",
  "DATE_AMBIGUOUS",
  "TIME_INVALID",
  "TIMEZONE_UNKNOWN",
  "TIMEZONE_NOT_IN_LIST",
  "DATE_PRECISION_NOT_IN_LIST",
  "TIME_PRECISION_NOT_IN_LIST",
  "PROVENANCE_INCOMPLETE",
  "PROVENANCE_INCOMPLETE_IN_LIST",
  "SHA_MISMATCH",
  "DUPLICATE_EXACT_COPY",
  "DUPLICATE_SAME_TECHNICIAN_DAY",
  "DOCUMENT_KIND_NOT_INSPECTION",
  "METRIC_SCORE_OVER_MAX",
  "METRIC_PERCENTAGE_OUT_OF_RANGE",
  "METRIC_MISSING_CODE",
  "METRIC_DUPLICATED",
  "RUBRIC_EMPTY",
  "SECTIONS_EMPTY",
  "NO_METRICS",
  "NO_METRICS_IN_LIST",
  "PARTIAL_STATUS_PENDING",
] as const;

export type GuardReasonCode = (typeof GUARD_REASON_CODES)[number];

export type GuardReason = {
  readonly code: GuardReasonCode;
  readonly severity: GuardSeverity;
  readonly field: string;
  readonly evidence: string;
  readonly ruleVersion: string;
  readonly computedAt: string;
};

export type GuardVerdictResult = {
  readonly inspectionId: string;
  readonly verdict: GuardVerdict;
  readonly tray: GuardTray;
  readonly official: boolean;
  readonly officialWithWarning: boolean;
  readonly reasons: readonly GuardReason[];
  readonly ruleVersion: string;
  readonly computedAt: string;
};
