import Link from "next/link";
import type { LegacyKpis } from "../contracts/legacy-dashboard-contract";

export function LegacyKpiRow({ kpis }: { readonly kpis: LegacyKpis }) {
  const inspections = `${kpis.inspeccionesUnicas} ${kpis.inspeccionesUnicas === 1 ? "inspección" : "inspecciones"}`;
  const critical = kpis.puntajesValidos === 0 ? "Sin puntajes válidos" : `${kpis.bajo70} de ${kpis.puntajesValidos} puntajes válidos`;
  return (
    <section className="legacy-kpi-grid" aria-label="Indicadores principales">
      <LegacyKpi label="Promedio global" value={kpis.promedioGlobal} hint={`Basado en ${kpis.puntajesValidos} puntajes válidos`} href="#cumplimiento-por-seccion" accent />
      <LegacyKpi label="Bajo 70%" value={`${kpis.bajo70} caso${kpis.bajo70 === 1 ? "" : "s"}`} hint={critical} href="/inspecciones?score=below70" />
      <LegacyKpi label="Inspecciones realizadas" value={inspections} href="/inspecciones" />
    </section>
  );
}

function LegacyKpi({ label, value, hint, href, accent = false }: { readonly label: string; readonly value: string; readonly hint?: string; readonly href: string; readonly accent?: boolean }) {
  return <Link href={href} className={`legacy-kpi-card${accent ? " is-accent" : ""}`} aria-label={`${label}: ${value}. Ver detalle`}><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}<em>Ver detalle →</em></Link>;
}
