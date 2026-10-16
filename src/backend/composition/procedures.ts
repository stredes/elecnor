import { ListProcedures } from "../application/procedures/list-procedures";
import { HttpProcedureReader } from "../adapters/outbound/http-procedure-reader";
import { MemoryProcedureReader } from "../adapters/outbound/memory-procedure-reader";
import type { Procedure } from "../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../ports/procedures/read-procedures";

const syntheticProcedures: readonly Procedure[] = [];

export function createProcedureQuery(reader?: ReadProcedures): ListProcedures {
  const selected = reader ?? (process.env.BACKEND_API_URL
    ? new HttpProcedureReader(process.env.BACKEND_API_URL)
    : new MemoryProcedureReader(syntheticProcedures));
  return new ListProcedures(selected);
}

export const procedureQuery = createProcedureQuery();
