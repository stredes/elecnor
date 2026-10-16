export function calculateMetricNonCompliance(
  compliance: number | null,
  applicable: number,
  explicitPercentage?: number | null,
): number | null {
  if (compliance === null || applicable <= 0) return null;
  if (explicitPercentage !== undefined && explicitPercentage !== null) return explicitPercentage;
  return Number((100 - compliance).toFixed(2));
}
