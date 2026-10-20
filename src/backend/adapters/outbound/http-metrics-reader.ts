import { parseMetricDetail, parseMetricList } from "../../domain/read-models/metric-parser";
import type { MetricDetail, MetricListResult } from "../../domain/read-models/metric-contract";
import type { MetricsReader } from "../../ports/read-model-readers";
import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, parseJsonResponse, requestJson, requestResponse, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpMetricsReader implements MetricsReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/metrics",
    private readonly options: HttpClientOptions = {},
    private readonly scope: "official" | "all" = "official",
  ) {}

  public list(band = "all"): Promise<MetricListResult> {
    const query = new URLSearchParams({ scope: this.scope });
    if (band && band !== "all") query.set("band", band);
    return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?${query}`, { method: "GET" }, parseMetricList, withDefaultScope({ ...this.options, scope: this.scope }));
  }

  public async detail(code: string): Promise<MetricDetail | null> {
    const response = await requestResponse(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}/${encodeURIComponent(code)}?scope=${this.scope}`, { method: "GET" }, withDefaultScope({ ...this.options, scope: this.scope }));
    if (response.status === 404) return null;
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "Backend request was rejected.", response.status);
    return parseJsonResponse(response, parseMetricDetail);
  }
}
