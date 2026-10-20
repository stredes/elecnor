import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

const TIME_ONLY_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ZONE_PATTERN = /^(?:[A-Za-z]+(?:\/[A-Za-z_+-]+){1,2}|UTC|GMT|Z|[+-](?:0\d|1[0-4])(?::?[0-5]\d))$/;
const DATE_PATTERNS: readonly (readonly [RegExp, "day" | "month" | "year"])[] = [
  [/^\d{4}-\d{2}-\d{2}$/, "day"],
  [/^\d{4}-\d{2}$/, "month"],
  [/^\d{4}$/, "year"],
];

export function dateReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const value = facts.localInspectionDate;
  const raw = facts.timestampRaw;
  if (!value && !raw) {
    return [guardReason("DATE_MISSING", "BLOCKED", "localInspectionDate", "sin fecha ni timestamp original", policy, computedAt)];
  }
  const precision = datePrecision(facts);
  if (precision === "year" || precision === "month") {
    return [guardReason("DATE_PARTIAL", policy.partialDateSeverity, "localInspectionDate", `precisión=${precision}; valor=${value ?? raw}`, policy, computedAt)];
  }
  if (precision !== "day") {
    return [guardReason("DATE_AMBIGUOUS", policy.ambiguousDateSeverity, "localInspectionDate", `precisión=${precision}; valor=${value ?? raw}`, policy, computedAt)];
  }
  if (facts.evaluationMode === "list" && facts.datePrecision === null) {
    return [guardReason("DATE_PRECISION_NOT_IN_LIST", "INFO", "datePrecision", "precisión de fecha no provista en listado", policy, computedAt)];
  }
  return [];
}

export function timeReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const reasons: GuardReason[] = [];
  const time = facts.localInspectionAt;
  if (time !== null && !TIME_ONLY_PATTERN.test(time)) {
    reasons.push(guardReason("TIME_INVALID", "WARNING", "localInspectionAt", `hora inválida="${time}"; se esperaba HH:MM`, policy, computedAt));
  }
  if ((time !== null || facts.timestampRaw !== null) && !knownZone(facts.timezone)) {
    if (facts.evaluationMode === "list" && facts.timezone === null) {
      reasons.push(guardReason("TIMEZONE_NOT_IN_LIST", "INFO", "timezone", "zona horaria no provista en listado", policy, computedAt));
    } else {
      reasons.push(guardReason("TIMEZONE_UNKNOWN", "WARNING", "timezone", `zona="${facts.timezone ?? "ausente"}"; no se usa la zona del servidor`, policy, computedAt));
    }
  }
  if (facts.evaluationMode === "list" && facts.timePrecision === null) {
    reasons.push(guardReason("TIME_PRECISION_NOT_IN_LIST", "INFO", "timePrecision", "precisión de hora no provista en listado", policy, computedAt));
  }
  return reasons;
}

function datePrecision(facts: InspectionFacts): string {
  const declared = facts.datePrecision;
  if (declared === "day" || declared === "month" || declared === "year") return declared;
  const value = facts.localInspectionDate;
  if (typeof value === "string") {
    const matched = DATE_PATTERNS.find(([pattern]) => pattern.test(value));
    if (matched) return matched[1];
  }
  return "unknown";
}

function knownZone(value: string | null): boolean {
  return typeof value === "string" && ZONE_PATTERN.test(value.trim());
}
