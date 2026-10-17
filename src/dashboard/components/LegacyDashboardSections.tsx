import Link from "next/link";
import type { LegacyDashboardModel } from "../contracts/legacy-dashboard-contract";
import { LegacyApprovalCharts } from "./LegacyApprovalCharts";
import { LegacyMetricTable } from "./LegacyMetricTable";
import { LegacyReadingGuide } from "./LegacyReadingGuide";
import { LegacyReportShell } from "./LegacyReportShell";
import { LegacySectionAccordion } from "./LegacySectionAccordion";

export function LegacyDashboardSections({ model }: { readonly model: LegacyDashboardModel }) {
  return <><LegacySectionAccordion model={model} /><LegacyMetricTable index="3" reportTitle="Métricas más débiles y más repetidas" title="Métricas más débiles" metrics={model.weakMetrics} lead="Ordenamos las métricas por menor cumplimiento. La cantidad de registros aplicables te ayuda a dimensionar cada resultado." guide="Sin métricas con registros aplicables para comparar." /><LegacyApprovalCharts model={model} /><EppSection model={model} /><LegacyMetricTable index="6" reportTitle="Indicadores con mejor desempeño observado" title="Métricas más fuertes" metrics={model.strongMetrics} lead="También es importante identificar qué parte del proceso parece más estable. Las métricas altas ayudan a entender dónde la ejecución observada se comporta de forma más consistente." guide="Sin métricas con registros aplicables para comparar." /><SynthesisSection model={model} /></>;
}

function EppSection({ model }: { readonly model: LegacyDashboardModel }) {
  const direct = model.narrative.epp.directAverage;
  const checklist = model.narrative.epp.checklist;
  const reveal = `En el mismo ámbito conviven dos comportamientos: el uso directo aparece alto (${format(direct)}), mientras el check list EPP queda en ${format(checklist)}.`;
  return <LegacyReportShell id="contraste-epp" index="5" title="Contraste dentro del bloque EPP" lead="El bloque EPP merece una lectura más fina. Mirarlo como un solo promedio puede ocultar diferencias internas muy importantes entre el uso observado del equipo y los controles asociados a su gestión."><div className="legacy-epp-grid"><EppLine label="Uso directo del EPP observado" value={direct} href="/metricas/epp-observado" /><EppLine label="Check list EPP (control)" value={checklist} href="/metricas/PREP_EPP_CHECK" danger /></div><LegacyReadingGuide title="Qué revela este contraste" how="Compara lo que la inspección observó en uso directo versus el control documental asociado." reveals={reveal} /></LegacyReportShell>;
}

function EppLine({ label, value, href, danger = false }: { readonly label: string; readonly value: number | null; readonly href: string; readonly danger?: boolean }) {
  return <Link href={href} className={`legacy-epp-line${danger ? " is-danger" : ""}`} aria-label={`${label}: ${format(value)}. Ver detalle`}><span>{label}</span><strong>{format(value)}</strong><i><em style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} /></i><small>Ver detalle →</small></Link>;
}

function SynthesisSection({ model }: { readonly model: LegacyDashboardModel }) {
  const weakest = model.narrative.sectionGap.weakest;
  const lowest = model.narrative.metricRange.lowest;
  const highest = model.narrative.metricRange.highest;
  const messages = [["Sección con menor cumplimiento", weakest ? `${weakest.name}: ${format(weakest.percentage)}.` : "Sin secciones con registros aplicables para comparar."], ["Métrica con menor cumplimiento", lowest ? `${lowest.metric}: ${format(lowest.compliance)}.` : "Sin métricas con registros aplicables para identificar el menor cumplimiento."], ["Resultado que podemos sostener", highest ? `${highest.metric}: ${format(highest.compliance)}.` : "Sin métricas con registros aplicables para identificar el mejor resultado."]];
  return <LegacyReportShell index="7" title="Qué nos muestran los datos" lead="Resumimos los resultados de la muestra para acompañarte a decidir qué revisar y qué sostener."><div className="legacy-synthesis-grid">{messages.map(([title, body], index) => <article key={title}><span>Mensaje {index + 1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></LegacyReportShell>;
}

function format(value: number | null): string { return value === null ? "—" : `${value.toFixed(2)}%`; }
