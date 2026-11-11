import { useState } from "react";
import type { ReportingPercentiles, ScoreBand } from "@/backend/domain/reporting/reporting-overview-contract";
import { exigencyLevelLabel, exigencyStateClass } from "@/backend/domain/reporting/exigency-scale";
import { LegacyChartTooltip } from "./LegacyChartTooltip";
import { LegacyBellCurveSvg } from "./LegacyBellCurveSvg";
import { estimateStandardDeviation, formatScore, normalizeDistribution, validScore, weightedMean } from "./legacy-bell-curve-math";
export { bandCenter, createCurve, estimateStandardDeviation, weightedMean } from "./legacy-bell-curve-math";

type LegacyBellCurveChartProps = { readonly distribution: readonly ScoreBand[]; readonly panorama: ReportingPercentiles; readonly threshold?: number | null };
type TooltipState = { readonly label: string; readonly value: string; readonly detail: string };

export function LegacyBellCurveChart({ distribution, panorama, threshold }: LegacyBellCurveChartProps) {
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);
  const observed = normalizeDistribution(distribution);
  const total = observed.reduce((sum, band) => sum + band.count, 0);
  if (total === 0) return <EmptyBellCurve />;
  const mean = validScore(panorama.media) ? panorama.media : weightedMean(observed);
  const standardDeviation = estimateStandardDeviation(observed, mean, panorama);
  return <figure className="legacy-bell-curve">
    <header className="legacy-bell-heading"><div><span>Lectura estadística</span><h3>Distribución real y referencia gaussiana</h3></div><b>Sin proyección</b></header>
    <p className="legacy-bell-intro">Las barras muestran los resultados observados por banda. La línea es una referencia gaussiana calculada con la media y la desviación derivadas de los datos. No reemplaza la distribución real ni implica que la mayoría esté en un nivel aceptable.</p>
    <LegacyBellCurveSvg distribution={observed} total={total} panorama={panorama} mean={mean} standardDeviation={standardDeviation} threshold={threshold} onTooltipChange={setActiveTooltip} />
    {activeTooltip && <LegacyChartTooltip {...activeTooltip} />}
    <div className="legacy-bell-summary" aria-label="Leyenda de la distribución"><span><i className="is-observed" />Barras: resultados reales y colorimetría por banda</span><span><i className="is-reference" />Línea: referencia gaussiana</span></div>
    <BellCurveStats panorama={panorama} mean={mean} threshold={threshold} />
    <figcaption><strong>Cómo leerla:</strong> las barras muestran cuántas auditorías caen en cada banda; la línea solo sirve como referencia de concentración y dispersión. P25, la media, P75 y el umbral preventivo son puntos de lectura, no una aprobación automática. La conclusión debe basarse en la distribución observada, los niveles configurados y el detalle de cada auditoría.</figcaption>
    <span className="legacy-bell-total">Base analizada: {total.toLocaleString("es-CL")} puntajes válidos</span>
  </figure>;
}

function BellCurveStats({ panorama, mean, threshold }: { readonly panorama: ReportingPercentiles; readonly mean: number; readonly threshold?: number | null }) {
  return <dl className="legacy-bell-stats">
    {validScore(panorama.p25) && <BellCurveStat label="P25" value={panorama.p25} />}
    <BellCurveStat label="Media observada" value={mean} />
    {validScore(panorama.mediana) && <BellCurveStat label="Mediana" value={panorama.mediana} />}
    {validScore(panorama.p75) && <BellCurveStat label="P75" value={panorama.p75} />}
    {validScore(threshold) && <BellCurveStat label="Umbral preventivo" value={threshold} reference />}
  </dl>;
}

function BellCurveStat({ label, value, reference = false }: { readonly label: string; readonly value: number; readonly reference?: boolean }) {
  const state = reference ? "is-reference" : exigencyStateClass(value);
  const level = reference ? "Referencia configurable" : exigencyLevelLabel(value);
  return <div className={`legacy-bell-stat ${state}`}><dt>{label}</dt><dd><strong>{formatScore(value)}</strong><span className="legacy-bell-stat-level">{level}</span></dd></div>;
}

function EmptyBellCurve() {
  return <figure className="legacy-bell-curve"><header className="legacy-bell-heading"><div><span>Lectura estadística</span><h3>Distribución real y referencia gaussiana</h3></div><b>Sin datos</b></header><p className="legacy-bell-empty">No hay puntajes válidos para representar.</p></figure>;
}
