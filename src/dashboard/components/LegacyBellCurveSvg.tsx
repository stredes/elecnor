import type { ReportingPercentiles } from "@/backend/domain/reporting/reporting-overview-contract";
import { distributionColor } from "./ExecutiveDashboardParts";
import { bandRange, buildMarkers, CHART, createCurve, displayBandLabel, formatPercentage, formatScore, scaleX, scaleY, SCORE_LABELS } from "./legacy-bell-curve-math";
import type { ObservedBand } from "./legacy-bell-curve-math";

type TooltipState = { readonly label: string; readonly value: string; readonly detail: string };
type LegacyBellCurveSvgProps = { readonly distribution: readonly ObservedBand[]; readonly total: number; readonly panorama: ReportingPercentiles; readonly mean: number; readonly standardDeviation: number; readonly threshold?: number | null; readonly onTooltipChange: (tooltip: TooltipState | null) => void };

export function LegacyBellCurveSvg({ distribution, total, panorama, mean, standardDeviation, threshold, onTooltipChange }: LegacyBellCurveSvgProps) {
  const points = createCurve(mean, standardDeviation);
  const peak = Math.max(...points.map((point) => point.y), Number.MIN_VALUE);
  const maximumBandCount = Math.max(...distribution.map((band) => band.count), 1);
  const curveScale = maximumBandCount / peak;
  const linePath = points.map((point, index) => `${index ? "L" : "M"}${scaleX(point.x)} ${scaleY(point.y * curveScale, maximumBandCount)}`).join(" ");
  const areaPath = `${linePath} L${CHART.right} ${CHART.baseline} L${CHART.left} ${CHART.baseline} Z`;
  const markers = buildMarkers(panorama, mean, threshold);
  return <svg viewBox="0 0 534 220" role="img" aria-label="Distribución real de puntajes y referencia de campana de Gauss">
    <title>Campana de Gauss de la distribución de puntajes</title>
    <desc>Las barras representan la distribución real por banda y usan la escala de conteos observados. La línea curva es una referencia normal calculada con la media y la desviación observadas. Las líneas verticales ubican la media y el umbral preventivo cuando se encuentra configurado.</desc>
    <line className="legacy-bell-axis" x1={CHART.left} x2={CHART.right} y1={CHART.baseline} y2={CHART.baseline} />
    {SCORE_LABELS.map((score) => <line className="legacy-bell-grid" key={`grid-${score}`} x1={scaleX(score)} x2={scaleX(score)} y1="34" y2={CHART.baseline} />)}
    <path className="legacy-bell-area" d={areaPath} aria-hidden="true" />
    {distribution.map((band) => <ScoreBandBar key={band.label} band={band} total={total} maximum={maximumBandCount} onTooltipChange={onTooltipChange} />)}
    <path className="legacy-bell-line" d={linePath} aria-hidden="true" />
    {markers.map((marker) => <ScoreMarker key={marker.label} marker={marker} onTooltipChange={onTooltipChange} />)}
    {SCORE_LABELS.map((score) => <text className="legacy-bell-score" key={score} x={scaleX(score)} y="178">{score}%</text>)}
    <text className="legacy-bell-axis-title" x={CHART.left} y="204">Puntaje de auditoría (%)</text>
  </svg>;
}

function ScoreBandBar({ band, total, maximum, onTooltipChange }: { readonly band: ObservedBand; readonly total: number; readonly maximum: number; readonly onTooltipChange: LegacyBellCurveSvgProps["onTooltipChange"] }) {
  const range = bandRange(band.label);
  const detail = `${formatPercentage(band.count, total)} del total de puntajes válidos`;
  const tooltip = { label: `Banda ${displayBandLabel(band.label)}`, value: `${band.count.toLocaleString("es-CL")} auditorías`, detail };
  const height = band.count / maximum * CHART.curveHeight;
  return <rect className="legacy-bell-bar" x={scaleX(range.minimum) + 1} y={CHART.baseline - height} width={Math.max(4, scaleX(range.maximum) - scaleX(range.minimum) - 2)} height={height} rx="2" fill={distributionColor(0, band.label)} tabIndex={0} role="img" aria-label={`${displayBandLabel(band.label)}: ${band.count} auditorías, ${detail}`} onMouseEnter={() => onTooltipChange(tooltip)} onMouseLeave={() => onTooltipChange(null)} onFocus={() => onTooltipChange(tooltip)} onBlur={() => onTooltipChange(null)}><title>{`${displayBandLabel(band.label)}: ${band.count} auditorías, ${detail}`}</title></rect>;
}

function ScoreMarker({ marker, onTooltipChange }: { readonly marker: ReturnType<typeof buildMarkers>[number]; readonly onTooltipChange: LegacyBellCurveSvgProps["onTooltipChange"] }) {
  const tooltip = { label: marker.label, value: formatScore(marker.value), detail: marker.kind === "threshold" ? "Umbral preventivo configurado" : marker.kind === "mean" ? "Promedio observado de los puntajes" : "Percentil observado en la distribución" };
  return <line className={`legacy-bell-marker is-${marker.kind}`} x1={scaleX(marker.value)} x2={scaleX(marker.value)} y1="34" y2={CHART.baseline} tabIndex={0} role="img" aria-label={`${marker.label}: ${formatScore(marker.value)}`} onMouseEnter={() => onTooltipChange(tooltip)} onMouseLeave={() => onTooltipChange(null)} onFocus={() => onTooltipChange(tooltip)} onBlur={() => onTooltipChange(null)}><title>{`${marker.label}: ${formatScore(marker.value)}`}</title></line>;
}
