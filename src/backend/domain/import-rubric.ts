import type { ExtractedInspectionFacts } from "./import-facts-contract";

export const UNKNOWN_RUBRIC = "RUBRICA_DESCONOCIDA";

export function detectRubric(facts: ExtractedInspectionFacts): string {
  const orders = new Set(
    facts.metrics
      .map((metric) => metric.sectionOrder)
      .filter((order): order is number => Boolean(order)),
  );
  if (facts.score?.maximum === 47 && orders.size >= 8) return "RUBRICA_47_9";
  if (facts.score?.maximum === 24 && orders.size <= 4) return "RUBRICA_24_4";
  return facts.rubricVersion ?? UNKNOWN_RUBRIC;
}
