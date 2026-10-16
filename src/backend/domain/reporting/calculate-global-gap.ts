import type { NarrativeGlobalInput, NarrativeGlobalGap } from "./reporting-narrative-contract";

export function calculateGlobalGap(input: NarrativeGlobalInput): NarrativeGlobalGap {
  const global = input.score || 0;
  return {
    global,
    gap: Math.max(0, 100 - global),
    healthy: Math.max(0, input.validScores - input.below70),
  };
}
