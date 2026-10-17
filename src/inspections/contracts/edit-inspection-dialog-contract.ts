import type { InspectionDetailInspection } from "@/backend/domain/inspections/detail-contract";

export type EditInspectionDialogProps = {
  readonly inspection: InspectionDetailInspection;
  readonly onCancel: () => void;
};
