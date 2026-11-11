import {
  parseProcedureCatalog,
  parseProcedureDetail,
} from "../../domain/procedures/procedure-parser";
import type {
  ProcedureCatalogQuery,
  ProcedureDetail,
} from "../../domain/procedures/procedure-contract";
import { isExcludedProcedureId, projectProcedureCatalog, projectProcedureDetail } from "../../domain/procedures/procedure-read-model";
import type { ProcedureReader } from "../../ports/procedure-reader";
import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, parseJsonResponse, requestJson, requestResponse, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpProcedureReader implements ProcedureReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/procedures",
    private readonly options: HttpClientOptions = {},
  ) {}

  public async catalog(query: ProcedureCatalogQuery) {
    const options = withDefaultScope(this.options);
    const params = new URLSearchParams({ scope: options.scope ?? "official" });
    if (query.q?.trim()) params.set("q", query.q.trim());
    if (query.area?.trim()) params.set("area", query.area.trim());
    const suffix = params.toString() ? `?${params}` : "";
    const catalog = await requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}${suffix}`, { method: "GET" }, parseProcedureCatalog, options);
    return projectProcedureCatalog(catalog);
  }

  public async detail(id: string): Promise<ProcedureDetail | null> {
    if (isExcludedProcedureId(id)) return null;
    const options = withDefaultScope(this.options);
    const url = `${joinEndpoint(this.endpoint, this.path)}/${encodeURIComponent(id)}`;
    const response = await requestResponse(this.fetcher, url, { method: "GET" }, options);
    if (response.status === 404) return null;
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "Backend request was rejected.", response.status);
    return projectProcedureDetail(await parseJsonResponse(response, parseProcedureDetail));
  }
}
