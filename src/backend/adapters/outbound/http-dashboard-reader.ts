import { parseDashboardSnapshot } from "../../domain/dashboard";
import { EXCLUDED_INSPECTION_COUNT } from "../../domain/inspection-exclusions";
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

  public async read() {
    const snapshot = await requestJson(
      this.fetcher,
      `${joinEndpoint(this.endpoint, this.path)}?scope=${this.scope}`,
      { method: "GET", headers: { accept: "application/json" } },
      parseDashboardSnapshot,
      withDefaultScope({ ...this.options, scope: this.scope }),
    );
    return {
      ...snapshot,
      metrics: snapshot.metrics.map((metric) => metric.id === "inspections" ? { ...metric, value: adjustedInspectionCount(metric.value) } : metric),
    };
  }
}

function adjustedInspectionCount(value: string): string {
  const count = Number(value);
  return Number.isFinite(count) ? String(Math.max(0, count - EXCLUDED_INSPECTION_COUNT)) : value;
}
