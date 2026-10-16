import type { NarrativeGlobalInput, NarrativeGlobalGap } from "./reporting-narrative-contract";

export function calculateGlobalGap(input: NarrativeGlobalInput): NarrativeGlobalGap {
  return {
    global: input.score,
    gap: Math.max(0, 100 - input.score),
    healthy: Math.max(0, input.validScores - input.below70),
  };
}
