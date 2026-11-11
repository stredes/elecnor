import type { ReportingPercentiles, ScoreBand } from "@/backend/domain/reporting/reporting-overview-contract";

export type CurvePoint = { readonly x: number; readonly y: number };
export type BandRange = { readonly minimum: number; readonly maximum: number };
export type ObservedBand = { readonly label: ScoreBand["label"]; readonly count: number };
export type BellMarker = { readonly label: string; readonly value: number; readonly kind: "percentile" | "mean" | "threshold" };
export const CHART = { left: 24, right: 510, baseline: 158, curveHeight: 104 } as const;
export const SCORE_LABELS = [0, 50, 100] as const;
const MIN_STANDARD_DEVIATION = 4;
const PERCENTILE_NORMALIZATION = 1.349;

export function normalizeDistribution(distribution: readonly ScoreBand[]): readonly ObservedBand[] { return distribution.map((band) => ({ label: band.label, count: safeCount(band.count) })); }
export function createCurve(mean: number, standardDeviation: number): readonly CurvePoint[] {
  const safeMean = clampScore(mean);
  const safeDeviation = safeStandardDeviation(standardDeviation);
  return Array.from({ length: 101 }, (_, score) => ({ x: score, y: safeFinite(Math.exp(-0.5 * ((score - safeMean) / safeDeviation) ** 2), 0) }));
}
export function estimateStandardDeviation(distribution: readonly ScoreBand[], mean: number, panorama: ReportingPercentiles): number {
  const p25 = validScore(panorama.p25) ? clampScore(panorama.p25) : null;
  const p75 = validScore(panorama.p75) ? clampScore(panorama.p75) : null;
  if (p25 !== null && p75 !== null && p75 >= p25) return safeStandardDeviation((p75 - p25) / PERCENTILE_NORMALIZATION);
  const observed = normalizeDistribution(distribution);
  const total = observed.reduce((sum, band) => sum + band.count, 0);
  if (!total) return MIN_STANDARD_DEVIATION;
  const variance = observed.reduce((sum, band) => sum + band.count * (bandCenter(band.label) - clampScore(mean)) ** 2, 0) / total;
  return safeStandardDeviation(Math.sqrt(Math.max(0, variance)));
}
export function weightedMean(distribution: readonly ScoreBand[]): number {
  const observed = normalizeDistribution(distribution);
  const total = observed.reduce((sum, band) => sum + band.count, 0);
  return total ? clampScore(observed.reduce((sum, band) => sum + band.count * bandCenter(band.label), 0) / total) : 0;
}
export function bandCenter(label: ScoreBand["label"]): number {
  if (label === "100") return 100;
  const [minimum, maximum] = label.split("-").map(Number);
  return (minimum + maximum) / 2;
}
export function buildMarkers(panorama: ReportingPercentiles, mean: number, threshold: number | null | undefined): readonly BellMarker[] {
  return [validScore(panorama.p25) ? { label: "P25", value: clampScore(panorama.p25), kind: "percentile" as const } : null, { label: "Media", value: mean, kind: "mean" as const }, validScore(panorama.p75) ? { label: "P75", value: clampScore(panorama.p75), kind: "percentile" as const } : null, validScore(threshold) ? { label: "Umbral preventivo", value: clampScore(threshold), kind: "threshold" as const } : null].filter((marker): marker is BellMarker => marker !== null);
}
export function bandRange(label: ScoreBand["label"]): BandRange {
  if (label === "100") return { minimum: 99, maximum: 100 };
  const [minimum, maximum] = label.split("-").map(Number);
  return { minimum: clampScore(minimum), maximum: clampScore(maximum + 1) };
}
export function displayBandLabel(label: ScoreBand["label"]): string { return label === "100" ? "100%" : `${label}%`; }
export function scaleX(score: number): number { return CHART.left + clampScore(score) / 100 * (CHART.right - CHART.left); }
export function scaleY(value: number, maximum: number): number { return CHART.baseline - safeFinite(value, 0) / Math.max(maximum, 1) * CHART.curveHeight; }
export function formatScore(value: number): string { return `${clampScore(value).toLocaleString("es-CL", { maximumFractionDigits: 2 })}%`; }
export function formatPercentage(value: number, total: number): string { return `${total ? (value / total * 100).toFixed(1) : "0.0"}%`; }
export function validScore(value: number | null | undefined): value is number { return value !== null && value !== undefined && Number.isFinite(value); }
export function clampScore(value: number): number { return Math.min(100, Math.max(0, safeFinite(value, 0))); }
function safeCount(value: number): number { return Math.max(0, Math.floor(safeFinite(value, 0))); }
function safeFinite(value: number, fallback: number): number { return Number.isFinite(value) ? value : fallback; }
function safeStandardDeviation(value: number): number { return Math.max(MIN_STANDARD_DEVIATION, safeFinite(value, MIN_STANDARD_DEVIATION)); }
