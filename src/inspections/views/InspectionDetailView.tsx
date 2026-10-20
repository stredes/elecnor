import Link from "next/link";
import { useRef, useState } from "react";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { DocumentProvenance } from "@/backend/domain/document-provenance";
import type { InspectionDetailViewProps } from "../contracts/inspection-detail-view-contract";
import { EditInspectionDialog } from "../components/EditInspectionDialog";

export function InspectionDetailView({ detail, downloadHref, error }: InspectionDetailViewProps) {
  const [editing, setEditing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  if (!detail) return <ReportLayout activeRoute="inspections" homeHref="/"><p role="alert">{error ?? "La inspección no está disponible."}</p></ReportLayout>;
  const close = () => { setEditing(false); triggerRef.current?.focus(); };
  return (
    <ReportLayout activeRoute="inspections" homeHref="/">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/inspecciones">Inspecciones</Link><span>/</span><span aria-current="page">{detail.inspection.id}</span></nav>
      <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Detalle de inspección</h1></div><div className="legacy-route-actions"><button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setEditing(true)}>Editar inspección</button>{downloadHref && <a href={downloadHref} download>Descargar PDF</a>}<Link href="/inspecciones">Volver a inspecciones</Link></div><p>{detail.inspection.technician} · {detail.inspection.date} · {detail.inspection.id}</p></header>
       <section aria-label="Resumen de inspección" className="legacy-summary-grid"><p><small>Cumplimiento</small><strong>{detail.inspection.percentage === null ? "—" : `${detail.inspection.percentage}%`}</strong></p><p><small>Contexto</small><strong>{contextLabel(detail.inspection.workContext)}</strong></p><p><small>Auditor</small><strong>{detail.inspection.auditor ?? "—"}</strong></p><p><small>Estado</small><strong>{detail.inspection.status ?? "—"}</strong></p><p><small>Acciones</small><strong>{detail.inspection.actions ?? "—"}</strong></p></section>
      <Provenance provenance={detail.inspection.provenance} fallbackFilename={detail.inspection.filename} />
      <section className="legacy-route-table"><table aria-label="Métricas de inspección"><thead><tr><th>Sección</th><th>Métrica</th><th>Estado</th></tr></thead><tbody>{detail.metrics.map((metric) => <tr key={metric.id}><th>{metric.section}</th><td>{metric.metric}</td><td>{metric.status ?? "—"}</td></tr>)}</tbody></table></section>
      {editing && <EditInspectionDialog inspection={detail.inspection} onCancel={close} />}
    </ReportLayout>
  );
}

function contextLabel(value?: string): string {
  if (value === "PISO") return "Nivel de piso";
  if (value === "ALTURA") return "Trabajo en altura";
  return "Sin clasificar";
}

function Provenance({ provenance, fallbackFilename }: { provenance?: DocumentProvenance | null; fallbackFilename: string | null }) {
  return <section aria-label="Provenance documental" className="legacy-content-card"><h2>Origen del documento</h2><dl><dt>Archivo</dt><dd>{provenance?.filename ?? fallbackFilename ?? "—"}</dd><dt>SHA-256</dt><dd>{provenance?.sha256 ?? "—"}</dd><dt>Origen</dt><dd>{provenance?.origin ?? "—"}</dd><dt>Fecha/hora de origen</dt><dd>{[provenance?.date, provenance?.time].filter(Boolean).join(" ") || "—"}</dd><dt>Recibido</dt><dd>{provenance?.receivedAt ?? "—"}</dd></dl></section>;
}
