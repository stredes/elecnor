import { groupProcedureFamilies } from "../../domain/procedures/group-procedure-families";
import type { ProcedureFamily, ProcedureQuery } from "../../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../../ports/procedures/read-procedures";

export class ListProcedureFamilies {
  public constructor(private readonly reader: ReadProcedures) {}

  public async execute(query: ProcedureQuery): Promise<readonly ProcedureFamily[]> {
    const result = await this.reader.list(query);
    return groupProcedureFamilies(result.data);
  }
}
