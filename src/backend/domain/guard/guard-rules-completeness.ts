import type { InspectionFacts } from "./guard-facts-contract";
import type { GuardReason } from "./guard-contract";
import type { GuardPolicy } from "./guard-policy";
import { guardReason } from "./guard-reason";

export function completenessReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  const reasons: GuardReason[] = [];
  const hasMetricsArray = facts.metrics.length > 0;
  const hasMetricCount = facts.metricCount !== null && facts.metricCount > 0;
  if (!hasMetricsArray && !hasMetricCount) {
    reasons.push(guardReason("NO_METRICS", "BLOCKED", "metrics", "sin ninguna métrica extraída", policy, computedAt));
  } else if (!hasMetricsArray && hasMetricCount) {
    reasons.push(guardReason("NO_METRICS_IN_LIST", "INFO", "metrics", `conteo de métricas=${facts.metricCount} (no evaluable en listado)`, policy, computedAt));
  }
  if (!filled(facts.rubric)) {
    reasons.push(guardReason("RUBRIC_EMPTY", "WARNING", "rubric", "rúbrica vacía o ausente", policy, computedAt));
  }
  const empty = facts.sections.filter((section) => section.metricCount === 0).map((section) => section.name);
  if (empty.length > 0) {
    reasons.push(guardReason("SECTIONS_EMPTY", "WARNING", "sections", `secciones sin métricas=${empty.join(", ")}`, policy, computedAt));
  }
  return reasons;
}

export function statusReasons(
  facts: InspectionFacts,
  policy: GuardPolicy,
  computedAt: string,
): GuardReason[] {
  if (facts.importStatus !== "PARCIAL") return [];
  return [
    guardReason("PARTIAL_STATUS_PENDING", "INFO", "importStatus", "estado PARCIAL conservado; se muestra como pendiente", policy, computedAt),
  ];
}

export function isPartial(facts: InspectionFacts): boolean {
  return facts.importStatus === "PARCIAL";
}

function filled(value: string | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
