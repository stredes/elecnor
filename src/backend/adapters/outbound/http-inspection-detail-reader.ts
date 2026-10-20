import { parseInspectionDetail } from "../../domain/inspections/detail-contract";
import type { InspectionDetail } from "../../domain/inspections/detail-contract";
import type { ReadInspectionDetail } from "../../ports/read-inspection-detail";
import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, parseJsonResponse, requestResponse, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpInspectionDetailReader implements ReadInspectionDetail {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/inspections",
    private readonly options: HttpClientOptions = {},
    private readonly scope = "official",
  ) {}

  public async read(id: string): Promise<InspectionDetail | null> {
    const response = await requestResponse(
      this.fetcher,
      `${joinEndpoint(this.endpoint, this.path)}/${encodeURIComponent(id)}?scope=${this.scope}`,
      { method: "GET", headers: { accept: "application/json" } },
      withDefaultScope({ ...this.options, scope: this.scope as "official" | "all" }),
    );
    if (response.status === 404) return null;
    if (!response.ok) throw new BackendAdapterError(failureForStatus(response.status), "Backend request was rejected.", response.status);
    return parseJsonResponse(response, parseInspectionDetail);
  }
}
