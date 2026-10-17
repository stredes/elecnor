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
    <ReportLayout activeRoute="inspections">
      <header className="dashboard-header"><div><p className="eyebrow">ELECNOR · INSPECCIÓN</p><h1>Detalle de inspección</h1><p>{detail.inspection.id}</p></div><Link href="/inspecciones">Volver al listado</Link></header>
      <section aria-label="Resumen de inspección" className="metric-grid"><p>Técnico: {detail.inspection.technician ?? "—"}</p><p>Auditor: {detail.inspection.auditor ?? "—"}</p><p>Estado: {detail.inspection.status}</p><p>Puntaje: {detail.inspection.percentage === null ? "—" : `${detail.inspection.percentage}%`}</p></section>
      <button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setEditing(true)}>Editar inspección</button>
      <table aria-label="Métricas de inspección"><thead><tr><th>Sección</th><th>Métrica</th><th>Estado</th></tr></thead><tbody>{detail.metrics.map((metric) => <tr key={metric.id}><td>{metric.section}</td><td>{metric.metric}</td><td>{metric.status ?? "—"}</td></tr>)}</tbody></table>
      {editing && <EditInspectionDialog inspection={detail.inspection} onCancel={close} />}
    </ReportLayout>
  );
}
