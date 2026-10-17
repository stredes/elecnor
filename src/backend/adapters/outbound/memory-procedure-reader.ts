import { selectProcedures } from "../../domain/procedures/select-procedures";
import type { Procedure, ProcedureList, ProcedureQuery } from "../../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../../ports/procedures/read-procedures";

export class MemoryProcedureReader implements ReadProcedures {
  private readonly procedures: readonly Procedure[];

  public constructor(procedures: readonly Procedure[]) {
    this.procedures = [...procedures];
  }

  public list(query: ProcedureQuery): Promise<ProcedureList> {
    return Promise.resolve(selectProcedures(this.procedures, query));
  }

  public get(id: string): Promise<Procedure | null> {
    return Promise.resolve(this.procedures.find((procedure) => procedure.id === id) ?? null);
  }
}
