import type { InspectionListQuery, InspectionListResult } from "@/backend/domain/inspection-list-contract";

export type InspectionsViewProps = {
  readonly list: InspectionListResult;
  readonly query: InspectionListQuery;
  readonly page: number;
};
