import Link from "next/link";
import type { ElecnorWorker } from "@/backend/domain/elecnor-contract";
import { formatInspectionDate, inspectionDateTime } from "@/inspections/inspection-display";
import type { ElecnorComparisonColumn, ElecnorComparisonSortState } from "./elecnor-view-contract";

const MAX_VISIBLE_INSPECTIONS = 7;

type Props = { readonly rows: readonly ElecnorWorker[]; readonly onReview: (worker: ElecnorWorker) => void; readonly reviewingWorkerId?: string | null; readonly sort?: ElecnorComparisonSortState; readonly onSort?: (key: ElecnorComparisonColumn) => void };

export function ElecnorComparisonTable({ rows, onReview, reviewingWorkerId = null, sort = { key: "name", direction: "asc" }, onSort = () => undefined }: Props) {
  return <table aria-label="Comparativa de trabajadores Elecnor">
    <thead><tr><SortableHeader label="Trabajador" sortKey="name" sort={sort} onSort={onSort} /><SortableHeader label="RUT" sortKey="rut" sort={sort} onSort={onSort} /><SortableHeader label="Nombre encontrado" sortKey="detected" sort={sort} onSort={onSort} /><SortableHeader label="Inspecciones" sortKey="inspections" sort={sort} onSort={onSort} /><SortableHeader label="Fechas" sortKey="dates" sort={sort} onSort={onSort} /><SortableHeader label="Resultado" sortKey="status" sort={sort} onSort={onSort} /><SortableHeader label="Revisión" sortKey="reviewed" sort={sort} onSort={onSort} /></tr></thead>
    <tbody>{rows.map(row => <WorkerRow key={row.worker_id || row.name} row={row} onReview={onReview} reviewing={reviewingWorkerId === row.worker_id} />)}</tbody>
  </table>;
}

function SortableHeader({ label, sortKey, sort, onSort }: { readonly label: string; readonly sortKey: ElecnorComparisonColumn; readonly sort: ElecnorComparisonSortState; readonly onSort: (key: ElecnorComparisonColumn) => void }) {
  const active = sort.key === sortKey;
  const direction = active ? sort.direction === "asc" ? "ascendente" : "descendente" : "sin ordenar";
  return <th aria-sort={active ? sort.direction === "asc" ? "ascending" : "descending" : "none"}><button type="button" className={`elecnor-sort-button${active ? " is-active" : ""}`} title={`Ordenar ${label}: ${direction}`} onClick={() => onSort(sortKey)}><span>{label}</span><i aria-hidden="true">{active ? sort.direction === "asc" ? "↑" : "↓" : "↕"}</i></button></th>;
}

function WorkerRow({ row, onReview, reviewing }: { readonly row: ElecnorWorker; readonly onReview: (worker: ElecnorWorker) => void; readonly reviewing: boolean }) {
  return <tr>
    <th scope="row"><div className="elecnor-worker"><strong>{row.name || "Trabajador sin nombre"}</strong><small>{row.commune || "Comuna no informada"}</small></div></th>
    <td><span className="elecnor-rut">{row.rut || "RUT no informado"}</span></td>
    <td><DetectedNames value={row.name_detected} /></td>
    <td><InspectionLinks row={row} /></td>
    <td><DateList row={row} /></td>
    <td><StatusCell status={row.status} /></td>
    <td><label className={`elecnor-review-control${reviewing ? " is-saving" : ""}`}><input type="checkbox" checked={row.reviewed} onChange={() => onReview(row)} disabled={reviewing} /><span>{reviewing ? "Guardando…" : row.reviewed ? "Revisado" : "Pendiente"}</span><span className="visually-hidden">Marcar revisado para {row.name}</span></label></td>
  </tr>;
}

function DetectedNames({ value }: { readonly value: string | null }) {
  const names = value?.split(",").map(name => name.trim()).filter(Boolean) ?? [];
  return names.length ? <div className="elecnor-detected-names">{names.map(name => <span key={name}>{name}</span>)}</div> : <span className="elecnor-muted">Sin coincidencia detectada</span>;
}

function InspectionLinks({ row }: { readonly row: ElecnorWorker }) {
  if (!row.inspection_count) return <span className="elecnor-muted">Sin inspecciones</span>;
  const visible = row.inspections.slice(0, MAX_VISIBLE_INSPECTIONS);
  return <div className="elecnor-inspections"><strong>{row.inspection_count} {row.inspection_count === 1 ? "registro" : "registros"}</strong><div>{visible.map((item, index) => <Link key={item.audit_id} href={`/inspecciones/${encodeURIComponent(item.audit_id)}`} title={item.audit_id} aria-label={`Abrir inspección ${item.audit_id}`}>Ver {index + 1}</Link>)}</div></div>;
}

function DateList({ row }: { readonly row: ElecnorWorker }) {
  if (!row.inspections.length) return <span className="elecnor-muted">—</span>;
  return <div className="elecnor-date-list">{row.inspections.slice(0, 3).map(item => <time key={item.audit_id} dateTime={inspectionDateTime(item.inspection_date)}>{formatInspectionDate(item.inspection_date)}</time>)}{row.inspections.length > 3 && <small>+{row.inspections.length - 3} más</small>}</div>;
}

function StatusCell({ status }: { readonly status: ElecnorWorker["status"] }) {
  const content = status === "INSPECCION_ENCONTRADA" ? "Coincidencia confirmada" : status === "REVISAR_VARIANTE" ? "Revisar variante" : "Pendiente de inspección";
  return <div className="elecnor-status-cell"><span className={`elecnor-status is-${status.toLowerCase()}`}>{content}</span></div>;
}
