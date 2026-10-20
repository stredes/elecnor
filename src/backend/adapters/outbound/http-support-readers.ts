import { parseFindings } from "../../domain/read-models/finding-parser";
import { parseLogs } from "../../domain/read-models/log-parser";
import { parseUnknownMetrics } from "../../domain/read-models/unknown-parser";
import type { FindingsReader, LogsReader, UnknownMetricsReader } from "../../ports/read-model-readers";
import { joinEndpoint, requestJson, type HttpClientOptions, withDefaultScope } from "./http-json";
import type { SupportPaths } from "./http-support-readers-contract";

export type { SupportPaths } from "./http-support-readers-contract";

export class HttpSupportReaders {
  private readonly unknownReader: HttpUnknownMetricsReader;
  private readonly findingReader: HttpFindingsReader;
  private readonly logReader: HttpLogsReader;

  public constructor(endpoint: string, fetcher: typeof fetch, paths: SupportPaths, options: HttpClientOptions) {
    this.unknownReader = new HttpUnknownMetricsReader(endpoint, fetcher, paths.unknowns, options);
    this.findingReader = new HttpFindingsReader(endpoint, fetcher, paths.findings, options);
    this.logReader = new HttpLogsReader(endpoint, fetcher, paths.logs, options);
  }

  public unknowns() { return this.unknownReader.list(); }
  public findings() { return this.findingReader.list(); }
  public logs() { return this.logReader.list(); }
}

export class HttpUnknownMetricsReader implements UnknownMetricsReader {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch, private readonly path = "/api/v1/unknown-metrics", private readonly options: HttpClientOptions = {}) {}
  public list() { return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?scope=official`, { method: "GET" }, parseUnknownMetrics, withDefaultScope(this.options)); }
}

export class HttpFindingsReader implements FindingsReader {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch, private readonly path = "/api/v1/findings", private readonly options: HttpClientOptions = {}) {}
  public list() { return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?scope=official`, { method: "GET" }, parseFindings, withDefaultScope(this.options)); }
}

export class HttpLogsReader implements LogsReader {
  public constructor(private readonly endpoint: string, private readonly fetcher: typeof fetch = fetch, private readonly path = "/api/v1/logs", private readonly options: HttpClientOptions = {}) {}
  public list() { return requestJson(this.fetcher, `${joinEndpoint(this.endpoint, this.path)}?scope=official`, { method: "GET" }, parseLogs, withDefaultScope(this.options)); }
}
