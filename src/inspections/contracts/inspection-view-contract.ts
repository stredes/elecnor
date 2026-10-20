import type { InspectionListQuery, InspectionListResult } from "@/backend/domain/inspection-list-contract";
import type { InspectionScope } from "@/backend/domain/inspection-scope";

export type InspectionsViewProps = {
  readonly list: InspectionListResult;
  readonly query: InspectionListQuery;
  readonly page: number;
  readonly scope?: InspectionScope;
  readonly error?: string;
};
