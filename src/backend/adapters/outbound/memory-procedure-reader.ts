import { syntheticProcedureCatalog, syntheticProcedureDetail } from "../../composition/synthetic-procedure-entrypoint";
import type { ProcedureCatalogQuery, ProcedureDetail } from "../../domain/procedures/procedure-contract";
import type { ProcedureReader } from "../../ports/procedure-reader";

export class MemoryProcedureReader implements ProcedureReader {
  public catalog(query: ProcedureCatalogQuery) { return syntheticProcedureCatalog.execute(query); }
  public detail(id: string): Promise<ProcedureDetail | null> { return syntheticProcedureDetail.execute(id); }
}
