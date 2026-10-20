export const DEFAULT_INSPECTION_SORT = "date_desc";
export const INSPECTION_PAGE_SIZE = 25;
export const DEFAULT_INSPECTION_LIMIT = 500;
export const MAX_INSPECTION_LIMIT = 1000;

export const INSPECTION_SORTS = [
  "date_desc", "date_asc", "auditor_asc", "auditor_desc",
  "technician_asc", "technician_desc", "score_desc", "score_asc",
  "status_asc", "status_desc",
] as const;

export const INSPECTION_SCORE_FILTERS = [
  "0to9", "10to19", "20to29", "30to39", "40to49", "50to59", "60to69",
  "70to79", "80to89", "90to99", "below70", "70to89", "perfect", "missing",
] as const;
export const INSPECTION_WORK_CONTEXTS = ["PISO", "ALTURA", "SIN_CLASIFICAR"] as const;

export type InspectionSort = (typeof INSPECTION_SORTS)[number];
export type InspectionStatus = string | null;
export type InspectionFilterStatus = "COMPLETA" | "PARCIAL" | "";
export type InspectionWorkContext = (typeof INSPECTION_WORK_CONTEXTS)[number];

export function parseInspectionWorkContext(value: unknown): InspectionWorkContext {
  if (value === undefined || value === null) return "SIN_CLASIFICAR";
  if (typeof value !== "string" || !INSPECTION_WORK_CONTEXTS.includes(value as InspectionWorkContext)) {
    throw new Error("Invalid inspection work context");
  }
  return value as InspectionWorkContext;
}

export type InspectionFilters = {
  readonly q: string;
  readonly date: string;
  readonly from: string;
  readonly to: string;
  readonly technician: string;
  readonly auditor: string;
  readonly region: string;
  readonly status: InspectionFilterStatus;
  readonly workContext?: InspectionWorkContext | "";
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
  readonly workContext?: InspectionWorkContext;
  readonly provenance?: DocumentProvenance | null;
  readonly uniqueness?: UniquenessFacts | null;
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
import type { DocumentProvenance } from "./document-provenance";
import type { UniquenessFacts } from "./uniqueness-facts";
