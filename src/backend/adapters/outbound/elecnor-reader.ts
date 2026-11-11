import type { ElecnorComparisonQuery, ElecnorComparisonResult } from "../../domain/elecnor-contract";
import { parseElecnorComparison } from "../../domain/elecnor-parser";
import { joinEndpoint, requestJson, requestResponse, type HttpClientOptions, withDefaultScope } from "./http-json";
import type { ElecnorComparisonReader } from "../../ports/elecnor-comparison-reader";

export class HttpElecnorComparisonReader implements ElecnorComparisonReader {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch, private readonly path = "/api/v1/elecnor/comparison", private readonly options: HttpClientOptions = {}) {}
  public list(query: ElecnorComparisonQuery): Promise<ElecnorComparisonResult> {
    const params = new URLSearchParams({ limit: String(query.limit), offset: String(query.offset), status: query.status, sort: query.sort ?? "name", direction: query.direction ?? "asc" });
    if (query.q.trim()) params.set("q", query.q.trim());
    return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?${params}`, { method: "GET" }, parseElecnorComparison, withDefaultScope(this.options));
  }
  public async update(workerId: string, reviewed: boolean, note: string | null): Promise<ElecnorComparisonResult["data"][number]> {
    const response = await requestResponse(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}/${encodeURIComponent(workerId)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewed, note }) }, withDefaultScope(this.options));
    if (!response.ok) throw new Error("No se pudo guardar la revisión");
    const payload = await response.json() as { data: unknown };
    return parseElecnorComparison({ data: [payload.data], total: 1, limit: 1, offset: 0, metrics: { total_workers: 1, with_inspection: 0, without_inspection: 0, exact_matches: 0, variant_matches: 0, reviewed: 0, pending_review: 0 } }).data[0];
  }
}
