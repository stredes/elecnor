import type { ReportingFacts } from "./reporting-facts-contract";
import type { ScoreBand, ScoreBandLabel } from "./reporting-overview-contract";

const BANDS: readonly [ScoreBandLabel, number, number][] = [
  ["0-49", 0, 0.5], ["50-59", 0.5, 0.6], ["60-69", 0.6, 0.7],
  ["70-79", 0.7, 0.8], ["80-89", 0.8, 0.9], ["90-99", 0.9, 1], ["100", 1, 1],
];

export function countScoreBands(facts: ReportingFacts): readonly ScoreBand[] {
  const scores = facts.inspections.flatMap((item) => item.percentage === null ? [] : [item.percentage]);
  return BANDS.map(([label, minimum, maximum]) => ({
    label,
    count: scores.filter((score) => label === "100"
      ? score === maximum
      : score >= minimum && score < maximum).length,
  }));
}
