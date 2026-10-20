import type {
  ProcedureCatalogQuery,
  ProcedureCatalogResult,
  ProcedureDetail,
} from "../domain/procedures/procedure-contract";

export interface ProcedureReader {
  catalog(query: ProcedureCatalogQuery): Promise<ProcedureCatalogResult>;
  detail(id: string): Promise<ProcedureDetail | null>;
}
