import type {
  NarrativeInput,
  NarrativeMetric,
  NarrativeSummary,
  NarrativeSection,
} from "./reporting-detail-contract";
import { calculateGlobalGap } from "./calculate-global-gap";

const LOW_BANDS = new Set(["0-49", "50-59", "60-69"]);

export function calculateNarrative(input: NarrativeInput): NarrativeSummary {
  const weakest = weakestSection(input.sections);
  const rated = input.sections.filter((section) => section.percentage !== null);
  return {
    globalGap: calculateGlobalGap(input.global),
    sectionGap: { weakest, restAverage: averageRest(rated, weakest) },
    lowBandCount: input.distribution
      .filter((point) => LOW_BANDS.has(point.label))
      .reduce((sum, point) => sum + point.count, 0),
    scatterRisk: scatterRisk(input),
    eppInsight: eppInsight(input.scatter, input.weak),
    metricRange: metricRange(input.weak, input.strong),
  };
}

export function formatSectionName(name: string): string {
  return name.split(/[\s-]+/).map((word) =>
    word.length ? word[0].toUpperCase() + word.slice(1) : word,
  ).join(" ");
}

function weakestSection(sections: readonly NarrativeSection[]): NarrativeSection | null {
  return sections.filter((section) => section.percentage !== null).reduce<NarrativeSection | null>(
    (weakest, section) => !weakest || section.percentage! < weakest.percentage!
      ? section
      : weakest,
    null,
  );
}

function averageRest(
  sections: readonly NarrativeSection[],
  weakest: NarrativeSection | null,
): number | null {
  if (!weakest) return null;
  const rest = sections.filter((section) => section.name !== weakest.name);
  return rest.length
    ? Number(
      (rest.reduce((sum, section) => sum + section.percentage!, 0) / rest.length).toFixed(2),
    )
    : null;
}

function scatterRisk(input: NarrativeInput): { risk: number; total: number } {
  const rated = input.scatter.filter((point) => point.y !== null);
  if (!rated.length) return { risk: 0, total: 0 };
  const threshold = Math.max(1, ...rated.map((point) => point.x)) / 2;
  return {
    risk: rated.filter((point) => point.y! < 70 && point.x >= threshold).length,
    total: rated.length,
  };
}

function eppInsight(scatter: NarrativeInput["scatter"], weak: readonly NarrativeMetric[]) {
  const direct = scatter.filter(
    (point) => point.section === "inspeccion y uso de epp" && point.y !== null,
  );
  const checklist = weak.find(
    (metric) => metric.code === "PREP_EPP_CHECK" ||
      (metric.code?.startsWith("PREP") && metric.metric.toLowerCase().includes("check list epp")),
  );
  return {
    directAverage: direct.length
      ? Number((direct.reduce((sum, point) => sum + point.y!, 0) / direct.length).toFixed(2))
      : null,
    checklist: checklist?.compliance ?? null,
  };
}

function metricRange(
  weak: readonly NarrativeMetric[],
  strong: readonly NarrativeMetric[],
) {
  return {
    lowest: extremeMetric(weak, "lowest"),
    highest: extremeMetric(strong, "highest"),
  };
}

function extremeMetric(
  metrics: readonly NarrativeMetric[],
  direction: "lowest" | "highest",
): NarrativeMetric | null {
  const rated = metrics.filter((metric) => metric.compliance !== null);
  if (!rated.length) return null;
  const ordered = [...rated].sort((left, right) => left.compliance! - right.compliance!);
  return direction === "lowest" ? ordered[0] : ordered.at(-1) ?? null;
}
