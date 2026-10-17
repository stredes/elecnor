import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { TechnicianViewProps } from "../contracts/technician-view-contract";

export function TechnicianView({ profile }: TechnicianViewProps) {
  const average = profile.promedio === null ? "—" : `${profile.promedio}%`;
  return (
    <ReportLayout activeRoute="inspections" homeHref="/">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/inspecciones">Inspecciones</Link><span>/</span><span aria-current="page">{profile.technician}</span></nav>
      <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>{profile.technician}</h1></div><Link href="/inspecciones">Volver a inspecciones</Link><p>Perfil sintético de inspecciones, fechas y resultados.</p></header>
      <section aria-label="Resumen del técnico" className="legacy-summary-grid"><p><small>Promedio</small><strong>Promedio: {average}</strong></p><p><small>Bajo 70%</small><strong>{profile.bajo70}</strong></p><p><small>Auditores</small><strong>{profile.auditores}</strong></p><p><small>Fechas</small><strong>{profile.fechas}</strong></p></section>
      <section className="legacy-route-table"><table aria-label="Inspecciones del técnico"><thead><tr><th>Fecha</th><th>Auditor</th><th>Puntaje</th><th>Acciones</th></tr></thead><tbody>{profile.inspections.map((inspection, index) => <tr key={inspection.id ?? `${inspection.date}-${index}`}><th>{inspection.date ?? "—"}</th><td>{inspection.auditor ?? "—"}</td><td>{inspection.percentage === null ? "—" : `${inspection.percentage}%`}</td><td>{inspection.actions ?? "—"}</td></tr>)}</tbody></table></section>
    </ReportLayout>
  );
}
