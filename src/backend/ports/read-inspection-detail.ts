import type { InspectionDetail } from "../domain/inspections/detail-contract";

export interface ReadInspectionDetail {
  read(id: string): Promise<InspectionDetail | null>;
}
