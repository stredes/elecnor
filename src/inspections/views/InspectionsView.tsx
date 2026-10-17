import Link from "next/link";
import { buildInspectionQuery } from "@/backend/domain/inspection-list-query";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import { InspectionListFilters } from "@/dashboard/components/InspectionListFilters";
import type { InspectionsViewProps } from "../contracts/inspection-view-contract";

export function InspectionsView({ list, query, page }: InspectionsViewProps) {
  const previousHref = page > 1 ? pageHref(query, page - 1) : null;
  const nextHref = page * query.limit < list.total ? pageHref(query, page + 1) : null;
  return (
    <ReportLayout activeRoute="inspections">
      <header className="dashboard-header"><div><p className="eyebrow">ELECNOR · INSPECCIONES</p><h1>Listado de inspecciones</h1></div></header>
      <p data-testid="inspection-total">{list.total} registros indexados.</p>
      <InspectionListFilters filters={query.filters} auditors={list.auditors} regions={list.regions} />
      <table aria-label="Lista de inspecciones"><thead><tr><th>Técnico</th><th>Fecha</th><th>Auditor</th><th>Puntaje</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>{list.data.map((row) => <tr data-testid="inspection-row" key={row.id}><td>{row.technician ?? "—"}</td><td>{row.date ?? "—"}</td><td>{row.auditor ?? "—"}</td><td>{row.percentage === null ? "—" : `${row.percentage}%`}</td><td>{row.status}</td><td><Link href={`/inspecciones/${encodeURIComponent(row.id)}`} aria-label={`Ver inspección ${row.id}`}>Ver</Link></td></tr>)}</tbody>
      </table>
      <nav aria-label="Paginación">{previousHref && <Link href={previousHref}>Anterior</Link>}<span>Página {page}</span>{nextHref && <Link href={nextHref}>Siguiente</Link>}</nav>
    </ReportLayout>
  );
}

function pageHref(query: InspectionsViewProps["query"], page: number): string {
  return `/inspecciones?${buildInspectionQuery({ ...query, offset: (page - 1) * query.limit })}`;
}
