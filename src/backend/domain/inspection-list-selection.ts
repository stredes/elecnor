import type {
  InspectionFilters,
  InspectionListItem,
  InspectionListQuery,
  InspectionListResult,
} from "./inspection-list-contract";

export function selectInspectionList(
  rows: readonly InspectionListItem[], query: InspectionListQuery,
): InspectionListResult {
  const filtered = rows.filter((row) => matches(row, query.filters));
  const ordered = [...filtered].sort((left, right) => compare(left, right, query.filters.sort));
  return {
    data: ordered.slice(query.offset, query.offset + query.limit),
    total: ordered.length,
    limit: query.limit,
    offset: query.offset,
    dates: options(rows.map((row) => row.date), true),
    auditors: options(rows.map((row) => row.auditor)),
    regions: options(rows.map((row) => row.region)),
  };
}

function matches(row: InspectionListItem, filters: InspectionFilters): boolean {
  if (filters.q && !searchable(row).some((value) => value.toLowerCase().includes(filters.q.toLowerCase()))) return false;
  if (filters.technician && row.technician !== filters.technician) return false;
  if (filters.auditor && row.auditor !== filters.auditor) return false;
  if (filters.region && row.region !== filters.region) return false;
  if (filters.status && row.status !== filters.status) return false;
  if (filters.date && row.date !== filters.date) return false;
  if (filters.from && (!row.date || row.date < filters.from)) return false;
  if (filters.to && (!row.date || row.date > filters.to)) return false;
  if (filters.month && (!row.date || !row.date.startsWith(filters.month))) return false;
  return scoreMatches(row.percentage, filters.score);
}

function searchable(row: InspectionListItem): string[] {
  return [row.id, row.date, row.time, row.technician, row.auditor, row.city, row.region, row.address, row.filename]
    .filter((value): value is string => Boolean(value));
}

function scoreMatches(value: number | null, filter: string): boolean {
  if (!filter) return true;
  if (filter === "missing") return value === null;
  if (filter === "perfect") return value === 100;
  if (filter === "below70") return value !== null && value < 70;
  if (filter === "70to89") return value !== null && value >= 70 && value < 90;
  const match = /^(\d+)to(\d+)$/.exec(filter);
  return match ? value !== null && value >= Number(match[1]) && value < Number(match[2]) + 1 : true;
}

function compare(left: InspectionListItem, right: InspectionListItem, sort: string): number {
  const descending = sort.endsWith("_desc");
  const field = sort.replace(/_(?:asc|desc)$/, "");
  const leftValue = field === "score" ? left.percentage : left[field as "date" | "auditor" | "technician" | "status"];
  const rightValue = field === "score" ? right.percentage : right[field as "date" | "auditor" | "technician" | "status"];
  const leftMissing = leftValue === null || leftValue === "";
  const rightMissing = rightValue === null || rightValue === "";
  if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;
  const comparison = String(leftValue ?? "").localeCompare(String(rightValue ?? ""), "es", { sensitivity: "base" });
  return descending ? -comparison : comparison;
}

function options(values: readonly (string | null)[], descending = false): string[] {
  const unique = [...new Set(values.filter((value): value is string => Boolean(value)))];
  return unique.sort((left, right) => right.localeCompare(left, "es", { sensitivity: "base" }) * (descending ? 1 : -1));
}
