import type {
  InspectionListQuery,
  InspectionListResult,
} from "../domain/inspection-list-contract";

export interface InspectionReader {
  list(query: InspectionListQuery): Promise<InspectionListResult>;
}
