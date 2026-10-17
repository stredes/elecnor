import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { TechnicianViewProps } from "../contracts/technician-view-contract";

export function TechnicianView({ profile }: TechnicianViewProps) {
  const average = profile.promedio === null ? "—" : `${profile.promedio}%`;
  return (
    <ReportLayout activeRoute="inspections">
      <header className="dashboard-header"><div><p className="eyebrow">ELECNOR · TÉCNICO</p><h1>{profile.technician}</h1></div><Link href="/inspecciones">Volver a inspecciones</Link></header>
      <section aria-label="Resumen del técnico" className="metric-grid"><p>Promedio: {average}</p><p>Bajo 70%: {profile.bajo70}</p><p>Auditores: {profile.auditores}</p><p>Fechas: {profile.fechas}</p></section>
      <table aria-label="Inspecciones del técnico"><thead><tr><th>Fecha</th><th>Auditor</th><th>Puntaje</th><th>Acciones</th></tr></thead><tbody>{profile.inspections.map((inspection, index) => <tr key={inspection.id ?? `${inspection.date}-${index}`}><td>{inspection.date ?? "—"}</td><td>{inspection.auditor ?? "—"}</td><td>{inspection.percentage === null ? "—" : `${inspection.percentage}%`}</td><td>{inspection.actions ?? "—"}</td></tr>)}</tbody></table>
    </ReportLayout>
  );
}
