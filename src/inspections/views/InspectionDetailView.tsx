import Link from "next/link";
import { useRef, useState } from "react";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { InspectionDetailViewProps } from "../contracts/inspection-detail-view-contract";
import { EditInspectionDialog } from "../components/EditInspectionDialog";

export function InspectionDetailView({ detail }: InspectionDetailViewProps) {
  const [editing, setEditing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => { setEditing(false); triggerRef.current?.focus(); };
  return (
    <ReportLayout activeRoute="inspections" homeHref="/">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/inspecciones">Inspecciones</Link><span>/</span><span aria-current="page">{detail.inspection.id}</span></nav>
      <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>Detalle de inspección</h1></div><div className="legacy-route-actions"><button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setEditing(true)}>Editar inspección</button><Link href="/inspecciones">Volver a inspecciones</Link></div><p>{detail.inspection.technician} · {detail.inspection.date} · {detail.inspection.id}</p></header>
      <section aria-label="Resumen de inspección" className="legacy-summary-grid"><p><small>Cumplimiento</small><strong>{detail.inspection.percentage === null ? "—" : `${detail.inspection.percentage}%`}</strong></p><p><small>Auditor</small><strong>{detail.inspection.auditor ?? "—"}</strong></p><p><small>Estado</small><strong>{detail.inspection.status}</strong></p><p><small>Acciones</small><strong>{detail.inspection.actions ?? "—"}</strong></p></section>
      <section className="legacy-route-table"><table aria-label="Métricas de inspección"><thead><tr><th>Sección</th><th>Métrica</th><th>Estado</th></tr></thead><tbody>{detail.metrics.map((metric) => <tr key={metric.id}><th>{metric.section}</th><td>{metric.metric}</td><td>{metric.status ?? "—"}</td></tr>)}</tbody></table></section>
      {editing && <EditInspectionDialog inspection={detail.inspection} onCancel={close} />}
    </ReportLayout>
  );
}
