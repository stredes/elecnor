import { buildInspectionQuery } from "../../domain/inspection-list-query";
import { MAX_INSPECTION_LIMIT, type InspectionListQuery, type InspectionListResult } from "../../domain/inspection-list-contract";
import { availableInspectionRegions, isUnknownRegion, regionAddressSearchTerm } from "../../domain/region-filter";
import { resolveInspectionRegion } from "../../domain/geography/resolve-location";
import { parseInspectionList } from "../../domain/inspection-list-parser";
import { selectInspectionList } from "../../domain/inspection-list-selection";
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
    const result = isUnknownRegion(query.filters.region)
      ? await this.requestUnknownRegion(query)
      : await this.request(query);
    return withoutExcludedItems(result, query, this.scope);
  }

  private async requestUnknownRegion(query: InspectionListQuery): Promise<InspectionListResult> {
    const completeQuery = { ...query, limit: MAX_INSPECTION_LIMIT, offset: 0, filters: { ...query.filters, region: "" } };
    const first = await this.request(completeQuery);
    const rows = [...first.data];
    let offset = rows.length;
    while (offset < first.total && rows.length > 0) {
      const next = await this.request({ ...completeQuery, offset });
      rows.push(...next.data);
      if (!next.data.length) break;
      offset += next.data.length;
    }
    const unknown = rows.filter((item) => !resolveInspectionRegion(item.region, item.city, item.address, item.filename));
    const visible = unknown.filter((item) => !isExcludedInspection(item.id));
    return { ...first, data: visible.slice(query.offset, query.offset + query.limit), total: visible.length, limit: query.limit, offset: query.offset };
  }

  private request(query: InspectionListQuery): Promise<InspectionListResult> {
    if (query.filters.workContext) return this.requestWithLocalWorkContextFilter(query);
    return this.requestPage(query);
  }

  private async requestWithLocalWorkContextFilter(query: InspectionListQuery): Promise<InspectionListResult> {
    const completeQuery = { ...query, limit: MAX_INSPECTION_LIMIT, offset: 0 };
    const first = await this.requestPage(completeQuery);
    const rows = [...first.data];
    while (rows.length < first.total) {
      const next = await this.requestPage({ ...completeQuery, offset: rows.length });
      if (!next.data.length) break;
      rows.push(...next.data);
    }
    return selectInspectionList(rows, { ...query, filters: { q: "", date: "", from: "", to: "", technician: "", auditor: "", region: "", status: "", workContext: query.filters.workContext, score: "", month: "", sort: query.filters.sort } });
  }

  private requestPage(query: InspectionListQuery): Promise<InspectionListResult> {
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
  if (isUnknownRegion(region)) return { ...query, filters: { ...query.filters, region: "" } };
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
