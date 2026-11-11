import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ElecnorComparisonResult, ElecnorComparisonSort, ElecnorWorker } from "@/backend/domain/elecnor-contract";
import { invalidateSectionCache } from "@/dashboard/cache/section-cache";
import { ElecnorComparisonTable } from "./ElecnorComparisonTable";
import type { ElecnorComparisonColumn, ElecnorComparisonSortState, ElecnorComparisonViewProps } from "./elecnor-view-contract";

const PAGE_SIZE = 25;
const REMOTE_SORTS: Partial<Record<ElecnorComparisonColumn, ElecnorComparisonSort>> = { name: "name", rut: "rut", inspections: "audits" };

export function ElecnorComparisonView({ initial, query, loadError }: ElecnorComparisonViewProps) {
  const [rows, setRows] = useState<readonly ElecnorWorker[]>(initial.data);
  const [metrics, setMetrics] = useState(initial.metrics);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(0);
  const [failed, setFailed] = useState(loadError);
  const [refreshing, setRefreshing] = useState(loadError || initial.data.length === 0);
  const [message, setMessage] = useState("");
  const [reviewingWorkerId, setReviewingWorkerId] = useState<string | null>(null);
  const [sort, setSort] = useState<ElecnorComparisonSortState>({ key: "name", direction: "asc" });
  const remoteSort = REMOTE_SORTS[sort.key] ?? null;
  const remoteDirection = remoteSort ? sort.direction : null;
  const load = useCallback(async (targetPage = page) => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(targetPage * PAGE_SIZE), status: query.status });
    if (query.q) params.set("q", query.q);
    if (remoteSort) { params.set("sort", remoteSort); params.set("direction", remoteDirection ?? "asc"); }
    try {
      const response = await fetch(`/api/elecnor/comparison?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("comparison unavailable");
      const payload = await response.json() as ElecnorComparisonResult;
      setRows(payload.data); setTotal(payload.total); setMetrics(payload.metrics); setFailed(false);
    } catch { setFailed(true); } finally { setRefreshing(false); }
  }, [page, query.q, query.status, remoteDirection, remoteSort]);
  useEffect(() => {
    if (remoteSort === null) return;
    if (!loadError && initial.data.length > 0 && page === 0) return;
    const request = window.setTimeout(() => { void load(page); }, 0);
    return () => window.clearTimeout(request);
  }, [initial.data.length, loadError, load, page, remoteSort]);
  const displayedRows = useMemo(() => sortRows(rows, sort), [rows, sort]);
  async function review(worker: ElecnorWorker) {
    setReviewingWorkerId(worker.worker_id);
    try {
      const response = await fetch(`/api/elecnor/comparison/${encodeURIComponent(worker.worker_id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewed: !worker.reviewed, note: worker.review_note }) });
      if (!response.ok) throw new Error("review unavailable");
      const payload = await response.json() as { data: ElecnorWorker };
      setRows(current => current.map(row => row.worker_id === payload.data.worker_id ? payload.data : row));
      const delta = payload.data.reviewed ? 1 : -1;
      setMetrics(current => ({ ...current, reviewed: current.reviewed + delta, pending_review: current.pending_review - delta }));
      invalidateSectionCache(); setMessage("Revisión guardada.");
    } catch { setMessage("No se pudo guardar la revisión."); } finally { setReviewingWorkerId(null); }
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstVisible = total ? page * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min((page + 1) * PAGE_SIZE, total);
  const changePage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || nextPage === page) return;
    setRows([]);
    setFailed(false);
    setRefreshing(true);
    setPage(nextPage);
  };
  const changeSort = (key: ElecnorComparisonColumn) => {
    const direction = sort.key === key ? sort.direction === "asc" ? "desc" : "asc" : key === "inspections" ? "desc" : "asc";
    setSort({ key, direction });
    if (REMOTE_SORTS[key]) { setRows([]); setFailed(false); setRefreshing(true); setPage(0); }
  };
  return <div className="elecnor-comparison">
    <nav className="legacy-breadcrumb" aria-label="Breadcrumb"><Link href="/">Inicio</Link><span>/</span><span aria-current="page">Comparativa Elecnor</span></nav>
    <header className="legacy-route-header elecnor-comparison-header"><div><span className="elecnor-eyebrow">Control de cobertura</span><h1>Comparativa Elecnor</h1><p>Contrasta la nómina entregada por Elecnor con los nombres identificados en las inspecciones.</p></div><div className="elecnor-source-badge"><span>Fuente</span><strong>Elecnor + inspecciones</strong><small>Consulta bajo demanda · 25 por página</small></div></header>
    <section className="elecnor-kpis" aria-label="Métricas de cobertura"><Kpi label="Trabajadores" value={metrics.total_workers} detail="En la nómina comparada" /><Kpi label="Cobertura encontrada" value={metrics.with_inspection} detail={`${coverage(metrics.with_inspection, metrics.total_workers)}% de la nómina`} tone="success" /><Kpi label="Pendientes de inspección" value={metrics.without_inspection} detail="Sin registro asociado" tone="warning" /><Kpi label="Revisados" value={metrics.reviewed} detail={`${metrics.pending_review} pendientes de validar`} tone="info" /></section>
    <section className="elecnor-reading-guide" aria-labelledby="comparison-guide-title"><div><span className="elecnor-section-kicker">Lectura rápida</span><h2 id="comparison-guide-title">Lectura rápida de la comparativa</h2><p>Usa el resultado para priorizar nombres que requieren revisión manual y confirmar qué trabajadores ya tienen evidencia en las inspecciones.</p></div><div className="elecnor-legend"><span><i className="is-confirmed" />Coincidencia confirmada</span><span><i className="is-review" />Revisar variante</span><span><i className="is-pending" />Pendiente</span></div></section>
    <form className="elecnor-filters" method="get"><div className="elecnor-filter-field"><label htmlFor="comparison-search">Buscar trabajador</label><input id="comparison-search" name="q" defaultValue={query.q} placeholder="Nombre o RUT" /></div><div className="elecnor-filter-field"><label htmlFor="comparison-status">Mostrar estado</label><select id="comparison-status" name="status" defaultValue={query.status}><option value="all">Todos los trabajadores</option><option value="with_inspection">Con inspección</option><option value="without_inspection">Sin inspección</option><option value="pending_review">Pendientes de revisar</option><option value="reviewed">Revisados</option></select></div><button type="submit">Aplicar filtros</button></form>
    {failed && <p role="alert" className="elecnor-message">No se pudo cargar la comparativa. <button type="button" onClick={() => { setRefreshing(true); setFailed(false); void load(); }} disabled={refreshing}>Reintentar</button></p>}{message && <p role="status" className="elecnor-message">{message}</p>}
    <div className="elecnor-results-toolbar"><strong>{firstVisible ? `${firstVisible}–${lastVisible} de ${total}` : "0"} trabajadores</strong><span>Orden: {sortLabel(sort)} · selecciona una inspección para ver su detalle.</span>{refreshing && rows.length > 0 && <span className="elecnor-refreshing" role="status"><i aria-hidden="true" />Actualizando…</span>}</div><div className="legacy-route-table elecnor-table-wrap" aria-busy={refreshing}>{refreshing && !rows.length ? <ComparisonLoading /> : <ElecnorComparisonTable rows={displayedRows} onReview={worker => void review(worker)} reviewingWorkerId={reviewingWorkerId} sort={sort} onSort={changeSort} />}{!failed && !refreshing && !rows.length && <p className="legacy-empty">No hay trabajadores para este filtro.</p>}</div>{total > PAGE_SIZE && <nav className="elecnor-pagination" aria-label="Paginación de la comparativa"><button type="button" aria-label="Página anterior" onClick={() => changePage(page - 1)} disabled={page === 0 || refreshing}>Anterior</button><span>Página <strong>{page + 1}</strong> de <strong>{totalPages}</strong></span><button type="button" aria-label="Página siguiente" onClick={() => changePage(page + 1)} disabled={page + 1 >= totalPages || refreshing}>Siguiente</button></nav>}
  </div>;
}

function ComparisonLoading() {
  return <div className="elecnor-loading-panel" role="status" aria-label="Cargando comparativa"><span className="elecnor-loading-spinner" aria-hidden="true" /><strong>Cargando comparativa…</strong><small>Estamos consultando la nómina y sus inspecciones asociadas.</small><div className="elecnor-skeleton-list" aria-hidden="true">{[1, 2, 3, 4, 5].map(item => <i key={item} />)}</div></div>;
}

function Kpi({ label, value, detail, tone = "default" }: { readonly label: string; readonly value: number; readonly detail: string; readonly tone?: string }) {
  return <div className={`elecnor-kpi is-${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function coverage(found: number, total: number) { return total ? Math.round((found / total) * 100) : 0; }

function sortRows(rows: readonly ElecnorWorker[], sort: ElecnorComparisonSortState): readonly ElecnorWorker[] {
  return [...rows].sort((left, right) => {
    const comparison = compareSortValue(sortValue(left, sort.key), sortValue(right, sort.key));
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

function sortValue(worker: ElecnorWorker, key: ElecnorComparisonColumn): string | number {
  if (key === "name") return worker.name;
  if (key === "rut") return worker.rut;
  if (key === "detected") return worker.name_detected ?? "";
  if (key === "inspections") return worker.inspection_count;
  if (key === "dates") return worker.inspections.reduce((latest, inspection) => inspection.inspection_date && inspection.inspection_date > latest ? inspection.inspection_date : latest, "");
  if (key === "status") return worker.status === "INSPECCION_ENCONTRADA" ? 0 : worker.status === "REVISAR_VARIANTE" ? 1 : 2;
  return worker.reviewed ? 1 : 0;
}

function compareSortValue(left: string | number, right: string | number): number {
  if (typeof left === "number" && typeof right === "number") return left - right;
  return String(left).localeCompare(String(right), "es", { numeric: true, sensitivity: "base" });
}

function sortLabel(sort: ElecnorComparisonSortState): string {
  const labels: Record<ElecnorComparisonColumn, string> = { name: "Trabajador", rut: "RUT", detected: "Nombre encontrado", inspections: "Inspecciones", dates: "Fechas", status: "Resultado", reviewed: "Revisión" };
  const direction = sort.key === "inspections" ? sort.direction === "asc" ? "menor a mayor" : "mayor a menor" : sort.key === "dates" ? sort.direction === "asc" ? "más antiguas" : "más recientes" : sort.direction === "asc" ? "A–Z" : "Z–A";
  return `${labels[sort.key]} · ${direction}`;
}
