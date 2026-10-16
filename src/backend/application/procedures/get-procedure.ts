import type { Procedure } from "../../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../../ports/procedures/read-procedures";

export class GetProcedure {
  public constructor(private readonly reader: ReadProcedures) {}

  public execute(id: string): Promise<Procedure | null> {
    return this.reader.get(id);
  }
}
