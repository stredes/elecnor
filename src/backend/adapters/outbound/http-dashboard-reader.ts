import { parseDashboardSnapshot } from "../../domain/dashboard";
import type { DashboardReader } from "../../ports/dashboard-reader";
import { joinEndpoint, requestJson, type HttpClientOptions, withDefaultScope } from "./http-json";

export class HttpDashboardReader implements DashboardReader {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly path = "/api/v1/dashboard",
    private readonly options: HttpClientOptions = {},
    private readonly scope: "official" | "all" = "official",
  ) {}

  public read() {
    return requestJson(
      this.fetcher,
      `${joinEndpoint(this.endpoint, this.path)}?scope=${this.scope}`,
      { method: "GET", headers: { accept: "application/json" } },
      parseDashboardSnapshot,
      withDefaultScope({ ...this.options, scope: this.scope }),
    );
  }
}
