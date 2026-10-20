import type { ProcedureDetail } from "@/backend/domain/procedures/procedure-contract";

export type ProcedureDetailViewProps = {
  readonly detail: ProcedureDetail | null;
  readonly downloadHref?: string | null;
  readonly error?: string;
};
