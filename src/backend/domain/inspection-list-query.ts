import {
  DEFAULT_INSPECTION_LIMIT,
  DEFAULT_INSPECTION_SORT,
  INSPECTION_SCORE_FILTERS,
  INSPECTION_SORTS,
  MAX_INSPECTION_LIMIT,
  type InspectionListQuery,
  type InspectionSort,
} from "./inspection-list-contract";

type RawValue = string | string[] | undefined;
const SORT_SET = new Set<string>(INSPECTION_SORTS);
const SCORE_SET = new Set<string>(INSPECTION_SCORE_FILTERS);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function parseInspectionQuery(params: Record<string, RawValue> = {}): InspectionListQuery {
  const sort = text(params.sort, 30);
  const score = text(params.score, 20);
  const status = text(params.status, 20);
  const month = text(params.month, 7);
  return {
    filters: {
      q: text(params.q), date: date(params.date), from: date(params.from), to: date(params.to),
      technician: text(params.technician), auditor: text(params.auditor), region: text(params.region),
      status: status === "COMPLETA" || status === "PARCIAL" ? status : "",
      score: SCORE_SET.has(score) ? score : "",
      month: MONTH_PATTERN.test(month) ? month : "",
      sort: (SORT_SET.has(sort) ? sort : DEFAULT_INSPECTION_SORT) as InspectionSort,
    },
    limit: integer(params.limit, DEFAULT_INSPECTION_LIMIT, 1, MAX_INSPECTION_LIMIT),
    offset: integer(params.offset, 0, 0, 1_000_000),
  };
}

export function buildInspectionQuery(query: InspectionListQuery): string {
  const params = new URLSearchParams();
  const { filters } = query;
  const values: Record<string, string> = {
    q: filters.q, date: filters.date, from: filters.from, to: filters.to,
    technician: filters.technician, auditor: filters.auditor, region: filters.region,
    status: filters.status, score: filters.score, month: filters.month,
  };
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  if (filters.sort !== DEFAULT_INSPECTION_SORT) params.set("sort", filters.sort);
  params.set("limit", String(query.limit));
  params.set("offset", String(query.offset));
  return params.toString();
}

export function parseInspectionPage(raw: RawValue): number {
  return integer(raw, 1, 1, 10_000);
}

function text(value: RawValue, maxLength = 100): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function date(value: RawValue): string {
  const candidate = text(value, 10);
  return DATE_PATTERN.test(candidate) ? candidate : "";
}

function integer(value: RawValue, fallback: number, low: number, high: number): number {
  const parsed = typeof value === "string" && /^-?\d+$/.test(value)
    ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? Math.max(low, Math.min(high, parsed)) : fallback;
}
