import {
  INSPECTION_SCORE_FILTERS,
  INSPECTION_SORTS,
  type InspectionFilters,
} from "@/backend/domain/inspection-list-contract";

type InspectionListFiltersProps = {
  readonly filters: InspectionFilters;
  readonly auditors: readonly string[];
  readonly regions: readonly string[];
};

export function InspectionListFilters({ filters, auditors, regions }: InspectionListFiltersProps) {
  return (
    <form method="get" action="/inspecciones" className="inspection-filters" aria-label="Filtros de inspecciones">
      <label htmlFor="q">Búsqueda<input id="q" name="q" defaultValue={filters.q} /></label>
      <label htmlFor="date">Fecha<input id="date" name="date" type="date" defaultValue={filters.date} /></label>
      <label htmlFor="from">Desde<input id="from" name="from" type="date" defaultValue={filters.from} /></label>
      <label htmlFor="to">Hasta<input id="to" name="to" type="date" defaultValue={filters.to} /></label>
      <label htmlFor="auditor">Auditor<select id="auditor" name="auditor" aria-label="Auditor" defaultValue={filters.auditor}>
        <option value="">Todos los auditores</option>{auditors.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label htmlFor="region">Región<select id="region" name="region" defaultValue={filters.region}>
        <option value="">Todas las regiones</option>{regions.map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label htmlFor="status">Estado<select id="status" name="status" defaultValue={filters.status}>
        <option value="">Todos los estados</option><option value="COMPLETA">Completas</option><option value="PARCIAL">Parciales</option>
      </select></label>
      <label htmlFor="score">Puntaje<select id="score" name="score" defaultValue={filters.score}>
        <option value="">Todos los puntajes</option>{INSPECTION_SCORE_FILTERS.map((value) => <option key={value} value={value}>{scoreLabel(value)}</option>)}
      </select></label>
      <label htmlFor="sort">Orden<select id="sort" name="sort" aria-label="Orden" defaultValue={filters.sort}>
        {INSPECTION_SORTS.map((value) => <option key={value} value={value}>{sortLabel(value)}</option>)}
      </select></label>
      <button type="submit">Aplicar filtros</button>
    </form>
  );
}

function scoreLabel(value: string): string {
  if (value === "below70") return "Bajo 70%";
  if (value === "perfect") return "100%";
  if (value === "missing") return "Sin puntaje";
  return value.replace("to", "% a ") + "%";
}

function sortLabel(value: string): string {
  return value.replaceAll("_", " ").replace("desc", "descendente").replace("asc", "ascendente");
}
