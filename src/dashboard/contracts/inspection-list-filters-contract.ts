import type { InspectionFilters } from "@/backend/domain/inspection-list-contract";

export type InspectionListFiltersProps = {
  readonly filters: InspectionFilters;
  readonly auditors: readonly string[];
  readonly regions: readonly string[];
};
