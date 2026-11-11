import type { ElecnorComparisonResult, ElecnorComparisonStatus } from "@/backend/domain/elecnor-contract";

export type ElecnorComparisonColumn = "name" | "rut" | "detected" | "inspections" | "dates" | "status" | "reviewed";
export type ElecnorComparisonSortDirection = "asc" | "desc";
export type ElecnorComparisonSortState = { readonly key: ElecnorComparisonColumn; readonly direction: ElecnorComparisonSortDirection };

export type ElecnorComparisonViewProps = {
  readonly initial: ElecnorComparisonResult;
  readonly query: { q: string; status: ElecnorComparisonStatus };
  readonly loadError: boolean;
};
