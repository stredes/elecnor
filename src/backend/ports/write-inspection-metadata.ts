import type { InspectionMetadataUpdate } from "../domain/inspections/update-policy";

export interface WriteInspectionMetadata {
  update(id: string, update: InspectionMetadataUpdate): Promise<void>;
}
