import Link from "next/link";
import { useState } from "react";
import type { LegacyDashboardModel, LegacyMetric } from "../contracts/legacy-dashboard-contract";
import { LegacyMetricQuickPanel } from "./LegacyMetricQuickPanel";
import { LegacyReadingGuide } from "./LegacyReadingGuide";
import { LegacyReportShell } from "./LegacyReportShell";

export function LegacySectionAccordion({ model }: { readonly model: LegacyDashboardModel }) {
  const [open, setOpen] = useState<string | null>(null);
  const [selected, setSelected] = useState<LegacyMetric | null>(null);
  const sections = [...model.sections].sort((left, right) => (left.compliance ?? 0) - (right.compliance ?? 0));
  const weakest = sections[0];
  const reveal = weakest ? `${formatName(weakest.name)} registra ${formatPercentage(weakest.compliance)}.` : "Sin secciones con registros aplicables para comparar.";
  return <LegacyReportShell id="cumplimiento-por-seccion" index="2" title="Dónde revisar el cumplimiento" lead="Comparamos los registros conformes y aplicables de cada sección para ayudarte a identificar qué revisar primero."><div className="legacy-accordion-card"><h3>Cumplimiento por sección</h3><ul className="legacy-accordion-list">{sections.map((section) => <li key={section.name}><button type="button" aria-expanded={open === section.name} onClick={() => setOpen(open === section.name ? null : section.name)}><span><b>{formatName(section.name)}</b><strong>{formatPercentage(section.compliance)}</strong></span><i><em className={section.compliance !== null && section.compliance < 70 ? "is-danger" : undefined} style={{ width: `${Math.min(100, Math.max(0, section.compliance ?? 0))}%` }} /><u /></i></button>{open === section.name && <SectionMetrics section={section} onSelect={setSelected} />}</li>)}</ul><p className="legacy-reference-line"><i /> Línea de referencia: 70%</p></div><LegacyReadingGuide title="Qué demuestra la comparación entre secciones" how="Cada barra es el cumplimiento agregado de una sección; abre una sección para consultar sus subconjuntos y luego entra al desglose específico de la métrica que necesites." reveals={reveal} /><LegacyMetricQuickPanel metric={selected} onClose={() => setSelected(null)} /></LegacyReportShell>;
}

function SectionMetrics({ section, onSelect }: { readonly section: LegacyDashboardModel["sections"][number]; readonly onSelect: (metric: LegacyMetric) => void }) {
  return <div className="legacy-accordion-detail"><table className="legacy-table"><thead><tr><th>Subconjunto</th><th>Aplicables</th><th>Cumplimiento</th><th>Detalle</th></tr></thead><tbody>{section.metrics.map((metric) => <tr key={metric.code}><th><button type="button" onClick={() => onSelect(metric)}>{metric.metric}</button></th><td>{metric.applicable}</td><td className={metric.compliance !== null && metric.compliance < 70 ? "is-danger" : ""}>{formatPercentage(metric.compliance)}</td><td><Link href={`/metricas/${encodeURIComponent(metric.code)}`}>Ver desglose →</Link></td></tr>)}</tbody></table></div>;
}

function formatName(value: string): string { return value.split(/\s+/u).map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" "); }
function formatPercentage(value: number | null): string { return value === null ? "—" : `${value.toFixed(2)}%`; }
