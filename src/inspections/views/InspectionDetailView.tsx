import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { DocumentProvenance } from "@/backend/domain/document-provenance";
import type { InspectionDetail, InspectionMetric } from "@/backend/domain/inspections/detail-contract";
import type { InspectionDetailViewProps } from "../contracts/inspection-detail-view-contract";
import { EditInspectionDialog } from "../components/EditInspectionDialog";
import { displayAuditor, formatInspectionDate, formatInspectionPercentage } from "../inspection-display";

export function InspectionDetailView({ detail, downloadHref, error }: InspectionDetailViewProps) {
  const [editing, setEditing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (!detail) return <ReportLayout activeRoute="inspections" homeHref="/"><p role="alert">{error ?? "La inspección no está disponible."}</p></ReportLayout>;
  const close = () => { setEditing(false); triggerRef.current?.focus(); };
  return <ReportLayout activeRoute="inspections" homeHref="/">
    <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/inspecciones">Inspecciones</Link><span>/</span><span aria-current="page">{detail.inspection.id}</span></nav>
    <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Detalle de inspección</h1></div><div className="legacy-route-actions"><button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setEditing(true)}>Editar inspección</button>{downloadHref && <a href={downloadHref} download>Descargar PDF</a>}<Link href="/inspecciones">Volver a inspecciones</Link></div><p>{detail.inspection.technician ?? "Técnico no informado"} · {formatInspectionDate(detail.inspection.date)} · {detail.inspection.time ? `${detail.inspection.time} h` : "Hora no informada"} · {detail.inspection.id}</p></header>
    <section aria-label="Resumen de inspección" className="legacy-summary-grid"><p><small>Cumplimiento</small><strong>{formatInspectionPercentage(detail.inspection.percentage)}</strong></p><p><small>Contexto</small><strong>{contextLabel(detail.inspection.workContext)}</strong><small>{detail.inspection.contextSource === "VISUAL" ? "Clasificación visual" : "Clasificación textual"}</small></p><p><small>Auditor</small><strong>{displayAuditor(detail.inspection.auditor)}</strong></p><p><small>Estado</small><strong>{detail.inspection.status ?? "—"}</strong></p><p><small>Acciones</small><strong>{detail.inspection.actions ?? "—"}</strong></p></section>
    {detail.inspection.contextSource === "VISUAL" && <VisualEvidence inspection={detail.inspection} />}
    {detail.inspection.observation && <ObservationPanel observation={detail.inspection.observation} />}
    <Provenance provenance={detail.inspection.provenance} fallbackFilename={detail.inspection.filename} />
    <MetricPanel metrics={detail.metrics} summaryObservation={detail.inspection.observation} />
    {editing && <EditInspectionDialog inspection={detail.inspection} onCancel={close} />}
  </ReportLayout>;
}

function contextLabel(value?: string): string { if (value === "PISO") return "Nivel de piso"; if (value === "ALTURA") return "Trabajo en altura"; if (value === "PREPARACION") return "En preparación"; return "Sin clasificar"; }
function VisualEvidence({ inspection }: { inspection: InspectionDetail["inspection"] }) {
  const confidence = inspection.visualConfidence === null || inspection.visualConfidence === undefined ? null : Math.round(inspection.visualConfidence * 100);
  return <section aria-label="Evidencia visual" className="legacy-content-card inspection-evidence-card"><div className="inspection-card-heading"><div><span className="legacy-card-kicker">Fuente de clasificación</span><h2>Evidencia visual</h2></div><span className="inspection-context-badge">{contextLabel(inspection.visualWorkContext ?? inspection.workContext)}</span></div><p className="inspection-evidence-lead">La imagen revisada determina el contexto mostrado para esta inspección.</p><div className="inspection-evidence-grid"><div><small>Página</small><strong>{inspection.visualEvidencePage ?? "—"}</strong></div><div><small>Imagen</small><strong>{inspection.visualEvidenceImage ?? "—"}</strong></div><div><small>Confianza</small><strong>{confidence === null ? "—" : `${confidence}%`}</strong>{confidence !== null && <span className="inspection-confidence"><i style={{ width: `${confidence}%` }} /></span>}</div></div><blockquote><span>Justificación</span>{inspection.visualRationale ?? "Sin justificación registrada."}</blockquote></section>;
}
function ObservationPanel({ observation }: { observation: string }) {
  return <section aria-label="Observaciones generales" className="legacy-content-card inspection-observation-card"><div className="inspection-card-heading"><div><span className="legacy-card-kicker">Registro de terreno</span><h2>Observación</h2></div></div><p>{observation}</p></section>;
}
function Provenance({ provenance, fallbackFilename }: { provenance?: DocumentProvenance | null; fallbackFilename: string | null }) { return <section aria-label="Provenance documental" className="legacy-content-card inspection-provenance"><div className="inspection-card-heading"><div><span className="legacy-card-kicker">Trazabilidad</span><h2>Origen del documento</h2></div><span className="inspection-source-badge">Documento fuente</span></div><dl><dt>Archivo</dt><dd>{provenance?.filename ?? fallbackFilename ?? "—"}</dd><dt>SHA-256</dt><dd className="inspection-sha">{provenance?.sha256 ?? "—"}</dd><dt>Origen</dt><dd>{provenance?.origin ?? "—"}</dd><dt>Fecha/hora de origen</dt><dd>{[provenance?.date, provenance?.time].filter(Boolean).join(" ") || "—"}</dd><dt>Recibido</dt><dd>{provenance?.receivedAt ?? "—"}</dd></dl></section>; }
function MetricPanel({ metrics, summaryObservation }: { metrics: readonly InspectionMetric[]; summaryObservation: string | null }) {
  const conforming = metrics.filter((metric) => metric.status === "CONFORME" || metric.status === "OK").length;
  const nonConforming = metrics.filter((metric) => metric.status === "NO_CONFORME").length;
  return <section className="legacy-route-table inspection-metrics-panel"><div className="inspection-metrics-heading"><div><span className="legacy-card-kicker">Control operativo</span><h2>Métricas de inspección</h2></div><div className="inspection-metric-summary"><span><b>{metrics.length}</b> controles</span><span className="is-good"><b>{conforming}</b> conformes</span><span className="is-danger"><b>{nonConforming}</b> no conformes</span></div></div><table aria-label="Métricas de inspección"><thead><tr><th>Control</th><th>Sección</th><th>Estado</th></tr></thead><tbody>{groupMetrics(metrics).map(([section, items]) => <Fragment key={section}><tr className="inspection-section-row"><th colSpan={3}>{section}<span>{items.length} controles</span></th></tr>{items.map((metric) => <tr key={metric.id}><th>{metric.metric}</th><td>{metric.section}</td><td><span className={`inspection-status ${statusClass(metric.status)}`}>{statusLabel(metric.status)}</span>{metric.observation && metric.observation !== summaryObservation && <p className="inspection-metric-observation">{metric.observation}</p>}</td></tr>)}</Fragment>)}</tbody></table></section>;
}
function groupMetrics(metrics: readonly InspectionMetric[]): [string, InspectionMetric[]][] { const groups = new Map<string, InspectionMetric[]>(); metrics.forEach((metric) => groups.set(metric.section, [...(groups.get(metric.section) ?? []), metric])); return [...groups.entries()]; }
function statusClass(status: string | null): string { if (status === "CONFORME" || status === "OK") return "is-good"; if (status === "NO_CONFORME") return "is-danger"; return "is-pending"; }
function statusLabel(status: string | null): string { if (!status) return "Sin estado"; return status.replaceAll("_", " "); }
