import { buildInspectionQuery } from "../../domain/inspection-list-query";
import { parseInspectionList } from "../../domain/inspection-list-parser";
import type {
  InspectionListQuery,
  InspectionListResult,
} from "../../domain/inspection-list-contract";
import type { InspectionReader } from "../../ports/inspection-reader";
import { joinEndpoint, requestJson, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpInspectionReader implements InspectionReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/inspections",
    private readonly options: HttpClientOptions = {},
    private readonly scope = "official",
  ) {}

  public async list(query: InspectionListQuery): Promise<InspectionListResult> {
    const url = `${joinEndpoint(this.endpoint, this.path)}?${buildInspectionQuery(query, this.scope)}`;
    return requestJson(
      this.fetcher,
      url,
      { method: "GET", headers: { accept: "application/json" } },
      parseInspectionList,
      withDefaultScope({ ...this.options, scope: this.scope as "official" | "all" }),
    );
  }
}
