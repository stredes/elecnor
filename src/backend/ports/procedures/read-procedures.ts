import type { Procedure, ProcedureList, ProcedureQuery } from "../../domain/procedures/procedure-contract";

export interface ReadProcedures {
  list(query: ProcedureQuery): Promise<ProcedureList>;
  get(id: string): Promise<Procedure | null>;
}
