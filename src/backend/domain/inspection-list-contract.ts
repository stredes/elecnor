export const DEFAULT_INSPECTION_SORT = "date_desc";
export const INSPECTION_PAGE_SIZE = 25;
export const DEFAULT_INSPECTION_LIMIT = 500;
export const MAX_INSPECTION_LIMIT = 1000;

export const INSPECTION_SORTS = [
  "date_desc", "date_asc", "auditor_asc", "auditor_desc",
  "technician_asc", "technician_desc", "score_desc", "score_asc",
  "status_asc", "status_desc",
] as const;

export type InspectionSort = (typeof INSPECTION_SORTS)[number];
export type InspectionStatus = "COMPLETA" | "PARCIAL";

export type InspectionFilters = {
  readonly q: string;
  readonly date: string;
  readonly from: string;
  readonly to: string;
  readonly technician: string;
  readonly auditor: string;
  readonly region: string;
  readonly status: InspectionStatus | "";
  readonly score: string;
  readonly month: string;
  readonly sort: InspectionSort;
};

export type InspectionListQuery = {
  readonly filters: InspectionFilters;
  readonly limit: number;
  readonly offset: number;
};

export type InspectionListItem = {
  readonly id: string;
  readonly date: string | null;
  readonly time: string | null;
  readonly technician: string | null;
  readonly auditor: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly percentage: number | null;
  readonly score: number | null;
  readonly maxScore: number | null;
  readonly actions: number | null;
  readonly rubric: string | null;
  readonly status: InspectionStatus;
  readonly filename: string | null;
};

export type InspectionListResult = {
  readonly data: readonly InspectionListItem[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly dates: readonly string[];
  readonly auditors: readonly string[];
  readonly regions: readonly string[];
};
