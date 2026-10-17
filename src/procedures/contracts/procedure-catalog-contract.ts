import type { ProcedureFamily } from "@/backend/domain/procedures/procedure-contract";

export type ProcedureFilters = { readonly q: string; readonly area: string };

export type ProceduresViewProps = {
  readonly families: readonly ProcedureFamily[];
  readonly total: number;
  readonly filters: ProcedureFilters;
};
