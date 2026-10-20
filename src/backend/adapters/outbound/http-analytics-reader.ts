import { parseAnalytics } from "../../domain/analytics/analytics-parser";
import type { ReportingAnalytics } from "../../domain/analytics/analytics-contract";
import type { AnalyticsReader } from "../../ports/read-model-readers";
import { joinEndpoint, requestJson, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpAnalyticsReader implements AnalyticsReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/analytics",
    private readonly options: HttpClientOptions = {},
  ) {}

  public read(minimo?: number, limite?: number): Promise<ReportingAnalytics> {
    const query = new URLSearchParams({ scope: "official" });
    if (minimo !== undefined) query.set("minimo", String(minimo));
    if (limite !== undefined) query.set("limite", String(limite));
    const suffix = query.toString() ? `?${query}` : "";
    return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}${suffix}`, { method: "GET" }, parseAnalytics, withDefaultScope(this.options));
  }
}
