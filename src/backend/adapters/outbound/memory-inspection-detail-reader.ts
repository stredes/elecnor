import type { InspectionDetail } from "../../domain/inspections/detail-contract";
import type { ReadInspectionDetail } from "../../ports/read-inspection-detail";

export class MemoryInspectionDetailReader implements ReadInspectionDetail {
  public constructor(private readonly details: readonly InspectionDetail[]) {}

  public async read(id: string): Promise<InspectionDetail | null> {
    return this.details.find((detail) => detail.inspection.id === id) ?? null;
  }
}
