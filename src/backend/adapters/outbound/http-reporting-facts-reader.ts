import { parseReportingFacts } from "../../domain/reporting/reporting-facts-parser";
import type { ReportingFacts } from "../../domain/reporting/reporting-facts-contract";
import type { ReadInspectionFacts } from "../../ports/read-inspection-facts";
import { joinEndpoint, requestJson, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpReportingFactsReader implements ReadInspectionFacts {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/reporting/facts",
    private readonly options: HttpClientOptions = {},
    private readonly scope: "official" | "all" = "official",
  ) {}

  public read(): Promise<ReportingFacts> {
    return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?scope=${this.scope}`, { method: "GET" }, parseReportingFacts, withDefaultScope({ ...this.options, scope: this.scope }));
  }
}
