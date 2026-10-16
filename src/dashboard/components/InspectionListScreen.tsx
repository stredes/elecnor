import Link from "next/link";
import { buildInspectionQuery } from "@/backend/domain/inspection-list-query";
import type { InspectionListPageProps } from "../contracts/inspection-list-page-contract";
import { InspectionListFilters } from "./InspectionListFilters";

export function InspectionListScreen({ list, query, page }: InspectionListPageProps) {
  const previousHref = page > 1 ? pageHref(query, page - 1) : null;
  const nextHref = page * query.limit < list.total ? pageHref(query, page + 1) : null;
  return (
    <main className="dashboard-shell" data-testid="inspection-list">
      <header className="dashboard-header">
        <div><p className="eyebrow">ELECNOR · INSPECCIONES</p><h1>Listado de inspecciones</h1></div>
        <Link href="/dashboard">Volver al dashboard</Link>
      </header>
      <p data-testid="inspection-total">{list.total} registros indexados.</p>
      <InspectionListFilters filters={query.filters} auditors={list.auditors} regions={list.regions} />
      <table aria-label="Lista de inspecciones">
        <thead><tr><th>Técnico</th><th>Fecha</th><th>Auditor</th><th>Puntaje</th><th>Estado</th></tr></thead>
        <tbody>{list.data.map((row) => <tr data-testid="inspection-row" key={row.id}>
          <td>{row.technician ?? "—"}</td><td>{row.date ?? "—"}</td><td>{row.auditor ?? "—"}</td>
          <td>{row.percentage === null ? "—" : `${row.percentage}%`}</td><td>{row.status}</td>
        </tr>)}</tbody>
      </table>
      <nav aria-label="Paginación">
        {previousHref && <Link href={previousHref}>Anterior</Link>}
        <span>Página {page}</span>
        {nextHref && <Link href={nextHref}>Siguiente</Link>}
      </nav>
    </main>
  );
}

function pageHref(query: InspectionListPageProps["query"], page: number): string {
  const next = { ...query, offset: (page - 1) * query.limit };
  return `/inspecciones?${buildInspectionQuery(next)}`;
}
