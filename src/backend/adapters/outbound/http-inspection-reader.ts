import { buildInspectionQuery } from "../../domain/inspection-list-query";
import { availableInspectionRegions, regionAddressSearchTerm } from "../../domain/region-filter";
import { parseInspectionList } from "../../domain/inspection-list-parser";
import type {
  InspectionListQuery,
  InspectionListResult,
} from "../../domain/inspection-list-contract";
import type { InspectionReader } from "../../ports/inspection-reader";
import { EXCLUDED_INSPECTION_COUNT, isExcludedInspection } from "../../domain/inspection-exclusions";
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
    const result = await this.request(query);
    return withoutExcludedItems(result, query, this.scope);
  }

  private request(query: InspectionListQuery): Promise<InspectionListResult> {
    const backendQuery = queryForBackend(query);
    const url = `${joinEndpoint(this.endpoint, this.path)}?${buildInspectionQuery(backendQuery, this.scope)}`;
    return requestJson(
      this.fetcher,
      url,
      { method: "GET", headers: { accept: "application/json" } },
      parseInspectionList,
      withDefaultScope({ ...this.options, scope: this.scope as "official" | "all" }),
    ).then((result) => ({ ...result, regions: availableInspectionRegions(result.regions) }));
  }
}

function withoutExcludedItems(result: InspectionListResult, query: InspectionListQuery, scope: string): InspectionListResult {
  const data = result.data.filter((item) => !isExcludedInspection(item.id));
  const excludedOnPage = result.data.length - data.length;
  const excludedFromTotal = excludedOnPage || scope === "all" && isUnfilteredQuery(query) ? EXCLUDED_INSPECTION_COUNT : 0;
  return { ...result, data, total: Math.max(0, result.total - excludedFromTotal) };
}

function isUnfilteredQuery(query: InspectionListQuery): boolean {
  const filters = query.filters;
  return !filters.q && !filters.date && !filters.from && !filters.to && !filters.technician
    && !filters.auditor && !filters.region && !filters.status && !filters.workContext
    && !filters.score && !filters.month;
}

function queryForBackend(query: InspectionListQuery): InspectionListQuery {
  const region = query.filters.region.trim();
  if (!region) return query;
  return {
    ...query,
    filters: {
      ...query.filters,
      // The current read model keeps the geolocalized region in the address,
      // while the persisted `region` column is empty. Search the address so
      // map selections and the list filter use the same data source.
      q: regionAddressSearchTerm(region),
      region: "",
    },
  };
}
