import type {
  InspectionListQuery,
  InspectionListResult,
} from "../domain/inspection-list-contract";
import type { InspectionReader } from "../ports/inspection-reader";

export class ListInspections {
  public constructor(private readonly reader: InspectionReader) {}

  public execute(query: InspectionListQuery): Promise<InspectionListResult> {
    return this.reader.list(query);
  }
}
