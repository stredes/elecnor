import { roundPython } from "./reporting-rounding";

export type MetricSnapshotInput = {
  readonly code: string;
  readonly metric: string;
  readonly section: string | null;
  readonly applicable: number;
  readonly conforming: number;
  readonly nonConforming: number;
  readonly compliance: number | null;
  readonly nonConformingPercentage?: number | null;
};

export type MetricSnapshot = MetricSnapshotInput & { readonly nonCompliance: number | null };

export function calculateMetricSnapshot(
  input: MetricSnapshotInput, source: "section" | "stat",
): MetricSnapshot {
  const nonCompliance = input.compliance === null || input.applicable <= 0
    ? null
    : input.nonConformingPercentage ?? deriveComplement(input, source);
  return { ...input, nonCompliance };
}

function deriveComplement(input: MetricSnapshotInput, source: "section" | "stat"): number {
  if (source === "section") {
    return roundPython(
      100 * (input.applicable - input.conforming) / input.applicable,
      1,
    );
  }
  return Number((100 - input.compliance!).toFixed(2));
}
