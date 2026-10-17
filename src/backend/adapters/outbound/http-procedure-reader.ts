import { parseProcedure, parseProcedureList } from "../../domain/procedures/parse-procedure-response";
import type { Procedure, ProcedureList, ProcedureQuery } from "../../domain/procedures/procedure-contract";
import type { ReadProcedures } from "../../ports/procedures/read-procedures";

export class HttpProcedureReader implements ReadProcedures {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch) {}

  public async list(query: ProcedureQuery): Promise<ProcedureList> {
    const params = new URLSearchParams({ q: query.q, area: query.area });
    const response = await this.fetcher(`${this.base()}/api/procedures?${params}`);
    if (!response.ok) throw new Error(`Procedure backend responded ${response.status}`);
    return parseProcedureList(await response.json());
  }

  public async get(id: string): Promise<Procedure | null> {
    const response = await this.fetcher(`${this.base()}/api/procedures/${encodeURIComponent(id)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Procedure backend responded ${response.status}`);
    return parseProcedure(await response.json());
  }

  private base(): string { return this.endpoint.replace(/\/$/, ""); }
}
