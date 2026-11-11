import Link from "next/link";
import { exigencyLevelLabel, exigencyStateClass } from "@/backend/domain/reporting/exigency-scale";
import { buildInspectionQuery } from "@/backend/domain/inspection-list-query";
import type { InspectionListItem, InspectionSort } from "@/backend/domain/inspection-list-contract";
import { summarizeInspectionList } from "@/backend/domain/inspection-list-summary";
import { ReportLayout } from "@/dashboard/components/ReportLayout";
import { InspectionListFilters } from "@/dashboard/components/InspectionListFilters";
import type { InspectionsViewProps } from "../contracts/inspection-view-contract";
import { displayAuditor, formatInspectionDate, formatInspectionPercentage, inspectionDateHasInferredYear, inspectionDateTime, INFERRED_INSPECTION_YEAR } from "../inspection-display";

type SortableColumn = "technician" | "date" | "auditor" | "work_context" | "score" | "status";

export function InspectionsView({ list, summary: overview, query, page, scope = "official", error }: InspectionsViewProps) {
  const previousHref = page > 1 ? pageHref(query, page - 1, scope) : null;
  const nextHref = page * query.limit < list.total ? pageHref(query, page + 1, scope) : null;
  const summary = overview ?? summarizeInspectionList(list.data);

  return (
    <ReportLayout activeRoute="inspections" homeHref="/">
      <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Inspecciones</span></nav>
      <header className="legacy-route-header inspection-list-header">
        <div className="inspection-list-title">
          <span className="inspection-list-kicker">Control operativo</span>
          <div><i aria-hidden="true" /><h1>Listado de inspecciones</h1></div>
          <p>Consulta, filtra y revisa el estado de las inspecciones registradas.</p>
        </div>
        <div className="inspection-list-header-actions">
          <span className="inspection-list-source">Fuente · Inspecciones indexadas</span>
          <Link href="/">Volver al dashboard</Link>
        </div>
      </header>

      <section className="inspection-list-kpis" aria-label="Resumen de inspecciones">
        <SummaryCard label="Registros encontrados" value={list.total.toLocaleString("es-CL")} detail="Coinciden con la consulta actual" />
        <SummaryCard label="En esta página" value={list.data.length.toLocaleString("es-CL")} detail={`Página ${page} · máximo ${query.limit}`} tone="info" />
        <SummaryCard label="Cumplimiento medio" value={summary.average === null ? "—" : `${summary.average.toFixed(2)}%`} detail={`Promedio de ${summary.scored.toLocaleString("es-CL")} registros con puntaje`} tone="success" />
        <SummaryCard label="Requieren atención" value={`${summary.attentionPercentage}%`} detail={`${summary.attention.toLocaleString("es-CL")} de ${summary.total.toLocaleString("es-CL")} · bajo 70% o parcial`} tone={summary.attention ? "warning" : "success"} />
      </section>

      <section className="inspection-list-guide" aria-labelledby="inspection-guide-title">
        <div><span className="inspection-list-section-kicker">Lectura rápida</span><h2 id="inspection-guide-title">Encuentra primero lo importante</h2><p>Prioriza los puntajes bajos y los estados parciales. Usa los encabezados para ordenar sin perder los filtros aplicados.</p>{query.filters.workContext === "PISO" && <aside className="inspection-list-observation" aria-label="Observación preventiva"><strong>Observación preventiva</strong><p>En estas auditorías, el trabajador fue localizado cuando se encontraba finalizando su labor. Por este motivo, no fue posible observar directamente el procedimiento de trabajo en altura. La evaluación se concentró en su desempeño en nivel de piso y en la utilización de sus equipos de protección personal (EPP).</p></aside>}</div>
        <div className="inspection-list-legend" aria-label="Leyenda de estados"><span><i className="is-complete" />Sin alertas · {summary.completePercentage}%</span><span><i className="is-attention" />Requiere revisión · {summary.attentionPercentage}%</span><span><i className="is-empty" />Sin puntaje · {summary.missingPercentage}%</span></div>
      </section>

      {error && <p role="alert" className="inspection-list-error">{error}</p>}
      <InspectionListFilters filters={query.filters} auditors={list.auditors} regions={list.regions} />

      <div className="inspection-results-toolbar">
        <div><span className="inspection-list-section-kicker">Resultados</span><p data-testid="inspection-total">{list.total} registros indexados.</p></div>
        <span>Mostrando {list.data.length} en esta página · selecciona una fila para abrir el detalle.</span>
      </div>

      <section className="legacy-route-table inspection-list-table-wrap">
        <table aria-label="Lista de inspecciones">
          <thead><tr>
            {sortableHeader("Técnico", "technician", query, scope, true)}
            {sortableHeader("Fecha", "date", query, scope)}
            {sortableHeader("Auditor", "auditor", query, scope, true)}
            {sortableHeader("Contexto", "work_context", query, scope, true)}
            {sortableHeader("Puntaje", "score", query, scope)}
            {sortableHeader("Estado", "status", query, scope, true)}
            <th scope="col">Acción</th>
          </tr></thead>
          <tbody>{list.data.map((row) => <InspectionRow key={row.id} row={row} />)}</tbody>
        </table>
        {list.data.length === 0 && <p className="legacy-empty">No se encontraron inspecciones.</p>}
      </section>

      <nav className="legacy-pagination inspection-pagination" aria-label="Paginación">{previousHref && <Link href={previousHref} prefetch={false}>Anterior</Link>}<span>Página {page}</span>{nextHref && <Link href={nextHref} prefetch={false}>Siguiente</Link>}</nav>
    </ReportLayout>
  );
}

function InspectionRow({ row }: { readonly row: InspectionListItem }) {
  const score = row.percentage;
  const location = [row.city, row.region].filter(Boolean).join(" · ");
  return <tr data-testid="inspection-row">
    <th scope="row"><Link className="inspection-person-cell" href={`/tecnicos/${encodeURIComponent(row.technician ?? "")}`}><strong>{row.technician ?? "Técnico no informado"}</strong><small>{location || row.address || "Ubicación no informada"}</small></Link></th>
    <td><div className="inspection-date-cell"><time dateTime={inspectionDateTime(row.date)}>{formatInspectionDate(row.date)}</time><small>{row.time ? `${row.time} h` : "Hora no informada"}</small>{inspectionDateHasInferredYear(row.date) && <small className="inspection-data-inferred">Año inferido: {INFERRED_INSPECTION_YEAR}</small>}</div></td>
    <td><div className={`inspection-auditor-cell ${row.auditor?.trim() ? "" : "is-missing"}`}><strong>{displayAuditor(row.auditor)}</strong>{row.auditor?.trim() ? row.region && <small>{row.region}</small> : <small className="inspection-data-missing">Dato pendiente</small>}</div></td>
    <td><span className={`inspection-context-pill is-${row.workContext?.toLowerCase() ?? "unknown"}`}>{contextLabel(row.workContext)}</span></td>
    <td><ScoreCell row={row} /></td>
    <td><StatusCell status={row.status} score={score} /></td>
    <td><Link className="inspection-detail-link" href={`/inspecciones/${encodeURIComponent(row.id)}`} aria-label={`Ver inspección ${row.id}`}><span>Abrir detalle</span><span aria-hidden="true">→</span></Link></td>
  </tr>;
}

function ScoreCell({ row }: { readonly row: InspectionListItem }) {
  if (row.percentage === null) return <span className="inspection-no-score">Sin puntaje</span>;
  const score = Math.max(0, Math.min(100, row.percentage));
  const levelClass = exigencyStateClass(row.percentage);
  return <div className={`inspection-score-cell ${levelClass}`}><strong>{formatInspectionPercentage(row.percentage)}</strong><span className="inspection-score-bar" role="progressbar" aria-label={`Puntaje ${formatInspectionPercentage(row.percentage)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score}><i style={{ width: `${score}%` }} /></span><small>{exigencyLevelLabel(row.percentage)} · {row.score !== null && row.maxScore !== null ? `${row.score}/${row.maxScore} puntos` : "Cumplimiento"}</small></div>;
}

function StatusCell({ status, score }: { readonly status: string | null; readonly score: number | null }) {
  const label = statusLabel(status);
  const lowCompliance = score !== null && score < 70;
  const statusTone = status === "PARCIAL" ? "is-attention" : status === "COMPLETA" ? "is-complete" : "is-empty";
  const statusText = status === "COMPLETA" ? "Registro completo" : label;
  const detailText = status === "PARCIAL" ? "Registro incompleto" : lowCompliance ? "Revisión por cumplimiento bajo" : status === "COMPLETA" ? "Sin observaciones de integridad" : "Información pendiente";
  return <div className="inspection-status-cell"><span className={`inspection-list-status ${statusTone}`}>{statusText}</span><small className={lowCompliance ? "inspection-data-missing" : undefined}>{detailText}</small></div>;
}

function SummaryCard({ label, value, detail, tone = "default" }: { readonly label: string; readonly value: string; readonly detail: string; readonly tone?: "default" | "info" | "success" | "warning" }) {
  return <div className={`inspection-list-kpi is-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function sortableHeader(
  label: string,
  column: SortableColumn,
  query: InspectionsViewProps["query"],
  scope: InspectionsViewProps["scope"],
  alphabetical = false,
) {
  const ascendingSort = `${column}_asc` as InspectionSort;
  const descendingSort = `${column}_desc` as InspectionSort;
  const currentSort = query.filters.sort;
  const ascending = currentSort === ascendingSort;
  const descending = currentSort === descendingSort;
  const nextSort = ascending ? descendingSort : ascendingSort;
  const direction = nextSort === ascendingSort ? "A–Z" : "Z–A";
  const directionLabel = alphabetical ? direction : nextSort === ascendingSort ? "ascendente" : "descendente";
  const href = `/inspecciones?${buildInspectionQuery({ ...query, filters: { ...query.filters, sort: nextSort }, offset: 0 }, scope)}`;
  return <th scope="col" aria-sort={ascending ? "ascending" : descending ? "descending" : "none"}><Link className="inspection-sort-link" href={href} aria-label={`Ordenar ${label} ${directionLabel}`}>{label}<span className="inspection-sort-indicator" aria-hidden="true">{ascending ? "↑" : descending ? "↓" : "↕"}</span></Link></th>;
}

function contextLabel(value?: string): string {
  if (value === "PISO") return "Nivel de piso";
  if (value === "ALTURA") return "Trabajo en altura";
  if (value === "PREPARACION") return "En preparación";
  return "Sin clasificar";
}

function statusLabel(value: string | null): string {
  if (value === "COMPLETA") return "Completa";
  if (value === "PARCIAL") return "Requiere revisión";
  if (!value) return "Sin estado";
  return value.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function pageHref(query: InspectionsViewProps["query"], page: number, scope: InspectionsViewProps["scope"]): string {
  const params = new URLSearchParams(buildInspectionQuery({ ...query, offset: (page - 1) * query.limit }, scope));
  params.set("page", String(page));
  return `/inspecciones?${params.toString()}`;
}
