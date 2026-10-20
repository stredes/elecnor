import type { InspectionDetail } from "@/backend/domain/inspections/detail-contract";

export type InspectionDetailViewProps = {
  readonly detail: InspectionDetail | null;
  readonly downloadHref?: string | null;
  readonly error?: string;
};
