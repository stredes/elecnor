import type { InspectionDetail } from "../../domain/inspections/detail-contract";
import type { ReadInspectionDetail } from "../../ports/read-inspection-detail";

export class GetInspectionDetail {
  public constructor(private readonly reader: ReadInspectionDetail) {}

  public execute(id: string): Promise<InspectionDetail | null> {
    return this.reader.read(id);
  }
}
