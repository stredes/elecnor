import type { Procedure, ProcedureList, ProcedureQuery } from "../../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../../ports/procedures/read-procedures";

export class ListProcedures {
  public constructor(private readonly reader: ReadProcedures) {}

  public execute(query: ProcedureQuery): Promise<ProcedureList> {
    return this.reader.list(query);
  }

  public get(id: string): Promise<Procedure | null> {
    return this.reader.get(id);
  }
}
