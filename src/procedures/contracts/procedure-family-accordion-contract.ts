import type { ProcedureFamily } from "@/backend/domain/procedures/procedure-contract";

export type ProcedureFamilyAccordionProps = {
  readonly families: readonly ProcedureFamily[];
};
