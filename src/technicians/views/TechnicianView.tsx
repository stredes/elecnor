import Link from "next/link";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import type { TechnicianViewProps } from "../contracts/technician-view-contract";
import { displayAuditor, formatInspectionDate } from "@/inspections/inspection-display";

export function TechnicianView({ profile, error }: TechnicianViewProps) {
  const scoredInspections = profile.inspections.filter((inspection) => inspection.percentage !== null).length;
  return (
    <ReportLayout activeRoute="inspections" homeHref="/">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><Link href="/inspecciones">Inspecciones</Link><span>/</span><span aria-current="page">{profile.technician}</span></nav>
      <header className="legacy-route-header"><div><i aria-hidden="true" /><h1>{profile.technician}</h1></div><Link href="/inspecciones">Volver a inspecciones</Link><p>{error ?? "Perfil de inspecciones, fechas y resultados."}</p></header>
      {error && <p role="alert">{error}</p>}
      <section aria-label="Resumen del técnico" className="legacy-summary-grid"><p><small>Promedio</small><strong>{formatAverage(profile.promedio)}</strong></p><p><small>Bajo 70%</small><strong>{profile.bajo70} de {scoredInspections}</strong></p><p><small>Auditores</small><strong>{profile.auditores}</strong></p><p><small>Fechas</small><strong>{profile.fechas}</strong></p></section>
      <p className="legacy-results-count">Los puntajes están expresados sobre 100%. “Bajo 70%” indica cuántas inspecciones no alcanzan el estándar de referencia; “Acciones” corresponde a acciones registradas.</p>
      <section className="legacy-route-table"><table aria-label="Inspecciones del técnico"><thead><tr><th>Fecha</th><th>Auditor</th><th>Puntaje (%)</th><th>Acciones registradas</th><th>Detalle</th></tr></thead><tbody>{profile.inspections.map((inspection, index) => <tr key={inspection.id ?? `${inspection.date}-${index}`}><th>{inspection.id ? <Link href={`/inspecciones/${encodeURIComponent(inspection.id)}`}>{formatInspectionDate(inspection.date) ?? "Ver inspección"}</Link> : inspection.date ?? "—"}</th><td>{displayAuditor(inspection.auditor)}</td><td>{formatInspectionPercentage(inspection.percentage)}</td><td>{inspection.actions ?? "—"}</td><td>{inspection.id ? <Link href={`/inspecciones/${encodeURIComponent(inspection.id)}`}>Ver detalle →</Link> : "—"}</td></tr>)}</tbody></table></section>
    </ReportLayout>
  );
}

function formatAverage(value: number | null): string { return value === null ? "—" : `${value.toFixed(2)}%`; }

function formatInspectionPercentage(value: number | null): string { return value === null ? "—" : `${(value * 100).toFixed(2)}%`; }
