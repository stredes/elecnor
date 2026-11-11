import { useState } from "react";
import type { ReportingPercentiles, ScoreBand } from "@/backend/domain/reporting/reporting-overview-contract";
import { LegacyChartTooltip } from "./LegacyChartTooltip";

type LegacyBellCurveChartProps = {
  readonly distribution: readonly ScoreBand[];
  readonly panorama: ReportingPercentiles;
  readonly threshold?: number;
};

type BandRange = { readonly minimum: number; readonly maximum: number };
type CurvePoint = { readonly x: number; readonly y: number };
type Marker = { readonly label: string; readonly value: number; readonly kind: "percentile" | "mean" | "threshold" };

const CHART = { left: 24, right: 510, baseline: 158, curveHeight: 104 } as const;
const SCORE_LABELS = [0, 50, 70, 100] as const;

export function LegacyBellCurveChart({ distribution, panorama, threshold: thresholdProp = 70 }: LegacyBellCurveChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<{ label: string; value: string; detail: string } | null>(null);
  const total = distribution.reduce((sum, band) => sum + band.count, 0);
  const mean = panorama.media ?? weightedMean(distribution);
  const threshold = clampScore(thresholdProp);
  const standardDeviation = estimateStandardDeviation(distribution, mean, panorama);
  const points = createCurve(mean, standardDeviation);
  const peak = Math.max(...points.map((point) => point.y), 1);
  const linePath = points.map((point, index) => `${index ? "L" : "M"}${scaleX(point.x)} ${scaleY(point.y, peak)}`).join(" ");
  const areaPath = `${linePath} L${CHART.right} ${CHART.baseline} L${CHART.left} ${CHART.baseline} Z`;
  const maximumBandCount = Math.max(...distribution.map((band) => band.count), 1);
  const markers: readonly Marker[] = [
    panorama.p25 === null ? null : { label: "P25", value: panorama.p25, kind: "percentile" },
    { label: "Media", value: mean, kind: "mean" },
    panorama.p75 === null ? null : { label: "P75", value: panorama.p75, kind: "percentile" },
    { label: "Umbral preventivo", value: threshold, kind: "threshold" },
  ].filter((marker): marker is Marker => marker !== null);

  return (
    <figure className="legacy-bell-curve">
      <header className="legacy-bell-heading">
        <div><span>Lectura estadística</span><h3>Distribución real y referencia gaussiana</h3></div>
        <b>Sin proyección</b>
      </header>
      <p className="legacy-bell-intro">Las barras muestran cómo se reparten los puntajes observados. La línea azul dibuja una campana de referencia para identificar dónde se concentra el resultado; no reemplaza la distribución real ni el detalle de cada auditoría.</p>
      <svg viewBox="0 0 534 220" role="img" aria-label="Distribución real de puntajes y referencia de campana de Gauss">
        <title>Campana de Gauss de la distribución de puntajes</title>
        <desc>Las barras representan la distribución real por banda. La línea curva es una referencia normal estimada con la media y los percentiles observados. La línea vertical amarilla marca el promedio y la línea roja discontinua marca el umbral preventivo.</desc>
        <line className="legacy-bell-axis" x1={CHART.left} x2={CHART.right} y1={CHART.baseline} y2={CHART.baseline} />
        {SCORE_LABELS.map((score) => <line className={`legacy-bell-grid ${score === threshold ? "is-threshold" : ""}`} key={`grid-${score}`} x1={scaleX(score)} x2={scaleX(score)} y1="34" y2={CHART.baseline} />)}
        <path className="legacy-bell-area" d={areaPath} aria-hidden="true" />
        {distribution.map((band) => {
          const range = bandRange(band.label);
          const x = scaleX(range.minimum) + 1;
          const width = Math.max(4, scaleX(range.maximum) - scaleX(range.minimum) - 2);
          const height = band.count / maximumBandCount * 46;
          return <rect className="legacy-bell-bar" key={band.label} x={x} y={CHART.baseline - height} width={width} height={height} rx="2" tabIndex={0} role="img" aria-label={`${band.label}: ${band.count} auditorías`} onMouseEnter={() => setActiveTooltip({ label: `Banda ${band.label}`, value: `${band.count.toLocaleString("es-CL")} auditorías`, detail: `${formatPercentage(band.count, total)} del total de puntajes válidos` })} onMouseLeave={() => setActiveTooltip(null)} onFocus={() => setActiveTooltip({ label: `Banda ${band.label}`, value: `${band.count.toLocaleString("es-CL")} auditorías`, detail: `${formatPercentage(band.count, total)} del total de puntajes válidos` })} onBlur={() => setActiveTooltip(null)}><title>{`${band.label}: ${band.count} auditorías, ${formatPercentage(band.count, total)} del total`}</title></rect>;
        })}
        <path className="legacy-bell-line" d={linePath} aria-hidden="true" />
        {markers.map((marker) => <line className={`legacy-bell-marker is-${marker.kind}`} key={marker.label} x1={scaleX(marker.value)} x2={scaleX(marker.value)} y1="34" y2={CHART.baseline} tabIndex={0} role="img" aria-label={`${marker.label}: ${formatScore(marker.value)}`} onMouseEnter={() => setActiveTooltip({ label: marker.label, value: formatScore(marker.value), detail: markerDetail(marker.kind) })} onMouseLeave={() => setActiveTooltip(null)} onFocus={() => setActiveTooltip({ label: marker.label, value: formatScore(marker.value), detail: markerDetail(marker.kind) })} onBlur={() => setActiveTooltip(null)}><title>{`${marker.label}: ${formatScore(marker.value)}`}</title></line>)}
        {SCORE_LABELS.map((score) => <text className="legacy-bell-score" key={score} x={scaleX(score)} y="178">{score}%</text>)}
        <text className="legacy-bell-axis-title" x={CHART.left} y="204">Puntaje de auditoría (%)</text>
      </svg>{activeTooltip && <LegacyChartTooltip {...activeTooltip} />}
      <div className="legacy-bell-summary" aria-label="Leyenda de la distribución">
        <span><i className="is-observed" />Barras: resultados reales</span>
        <span><i className="is-reference" />Línea: referencia gaussiana</span>
      </div>
      <dl className="legacy-bell-stats">
        <div><dt>Media observada</dt><dd>{formatScore(mean)}</dd></div>
        {panorama.mediana !== null && <div><dt>Mediana</dt><dd>{formatScore(panorama.mediana)}</dd></div>}
        <div><dt>Umbral preventivo</dt><dd>{formatScore(threshold)}</dd></div>
        {panorama.p25 !== null && panorama.p75 !== null && <div><dt>Rango central P25–P75</dt><dd>{formatScore(panorama.p25)}–{formatScore(panorama.p75)}</dd></div>}
      </dl>
      <figcaption><strong>Cómo leerla:</strong> las barras muestran cuántas auditorías caen en cada banda; busca primero las más altas para encontrar la mayor concentración. La media resume el promedio y la mediana muestra el punto central de los resultados. Si la campana se desplaza respecto del umbral, sirve como señal para orientar la revisión, pero la conclusión debe basarse en las barras y en el detalle de cada auditoría.</figcaption>
      <span className="legacy-bell-total">Base analizada: {total.toLocaleString("es-CL")} puntajes válidos</span>
    </figure>
  );
}

function createCurve(mean: number, standardDeviation: number): readonly CurvePoint[] {
  return Array.from({ length: 101 }, (_, score) => ({ x: score, y: Math.exp(-0.5 * ((score - mean) / standardDeviation) ** 2) }));
}

function estimateStandardDeviation(distribution: readonly ScoreBand[], mean: number, panorama: ReportingPercentiles): number {
  if (panorama.p25 !== null && panorama.p75 !== null && panorama.p75 > panorama.p25) return Math.max((panorama.p75 - panorama.p25) / 1.349, 4);
  const total = distribution.reduce((sum, band) => sum + band.count, 0);
  if (!total) return 15;
  const variance = distribution.reduce((sum, band) => sum + band.count * (bandCenter(band.label) - mean) ** 2, 0) / total;
  return Math.max(Math.sqrt(variance), 4);
}

function weightedMean(distribution: readonly ScoreBand[]): number {
  const total = distribution.reduce((sum, band) => sum + band.count, 0);
  return total ? distribution.reduce((sum, band) => sum + band.count * bandCenter(band.label), 0) / total : 0;
}

function bandCenter(label: ScoreBand["label"]): number {
  const range = bandRange(label);
  return (range.minimum + range.maximum) / 2;
}

function bandRange(label: ScoreBand["label"]): BandRange {
  if (label === "100") return { minimum: 99, maximum: 100 };
  const [minimum, maximum] = label.split("-").map(Number);
  return { minimum, maximum: maximum + 1 };
}

function scaleX(score: number): number { return CHART.left + Math.min(100, Math.max(0, score)) / 100 * (CHART.right - CHART.left); }
function scaleY(value: number, peak: number): number { return CHART.baseline - value / peak * CHART.curveHeight; }
function formatScore(value: number): string { return `${value.toLocaleString("es-CL", { maximumFractionDigits: 2 })}%`; }
function formatPercentage(value: number, total: number): string { return `${total ? (value / total * 100).toFixed(1) : "0.0"}%`; }
function clampScore(value: number): number { return Math.min(100, Math.max(0, value)); }
function markerDetail(kind: Marker["kind"]): string { return kind === "threshold" ? "Umbral preventivo de referencia" : kind === "mean" ? "Promedio observado de los puntajes" : "Percentil observado en la distribución"; }
