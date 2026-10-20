import type { GuardMetricFacts, InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

export function metricReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const reasons: GuardReason[] = [];
  const seen = new Set<string>();
  facts.metrics.forEach((metric, index) => {
    const field = `metrics[${index}]`;
    if (!filled(metric.code)) {
      reasons.push(guardReason("METRIC_MISSING_CODE", "BLOCKED", `${field}.code`, `código ausente en sección=${metric.section ?? "null"}`, policy, computedAt));
    } else {
      const key = `${metric.section ?? ""}::${metric.code ?? ""}`.toLowerCase();
      if (seen.has(key)) {
        reasons.push(guardReason("METRIC_DUPLICATED", "WARNING", `${field}.code`, `código=${metric.code} repetido en sección=${metric.section ?? "null"}`, policy, computedAt));
      }
      seen.add(key);
    }
    if (metric.score !== null && metric.maxScore !== null && metric.score > metric.maxScore) {
      reasons.push(guardReason("METRIC_SCORE_OVER_MAX", policy.scoreOverMaxSeverity, `${field}.score`, `puntaje=${metric.score} supera máximo=${metric.maxScore}`, policy, computedAt));
    }
    if (metric.percentage !== null && (metric.percentage < 0 || metric.percentage > 100)) {
      reasons.push(guardReason("METRIC_PERCENTAGE_OUT_OF_RANGE", "WARNING", `${field}.percentage`, `porcentaje=${metric.percentage} fuera de escala 0-100`, policy, computedAt));
    }
  });
  return reasons;
}

function filled(value: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function metricKey(metric: GuardMetricFacts): string {
  return `${metric.section ?? ""}::${metric.code ?? ""}`.toLowerCase();
}
