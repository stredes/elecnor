import { parseDriveSyncStatus, parseDriveSyncSummary } from "./import-operation-parser";
import { BackendAdapterError, failureForStatus } from "./http-errors";
import { joinEndpoint, parseJsonResponse, requestResponse, type HttpClientOptions } from "./http-json";
import type { DriveSyncResult, DriveSyncStatus } from "../../domain/import-operation-contract";
import type { DriveImportGateway, DriveSyncRequest } from "../../ports/drive-import-gateway";

export class HttpDriveImportGateway implements DriveImportGateway {
  public constructor(
    private readonly endpoint: string,
    private readonly fetcher: typeof fetch = fetch,
    private readonly syncPath = "/api/v1/sync/drive",
    private readonly statusPath = "/api/v1/sync/drive/{id}",
    private readonly retryPath = "/api/v1/sync/drive/{id}/retry",
    private readonly options: HttpClientOptions = {},
    private readonly stateEnabled = true,
  ) {}

  public async sync(request: DriveSyncRequest): Promise<DriveSyncResult> {
    const params = new URLSearchParams({ limit: String(request.limit ?? 20) });
    const headers = new Headers({ accept: "application/json" });
    const requestId = request.requestId ?? request.retryOf;
    if (requestId) headers.set("X-Request-Id", requestId);
    const response = await requestResponse(this.fetcher, `${joinEndpoint(this.endpoint, this.syncPath)}?${params}`, {
      method: "POST", headers,
    }, this.options);
    if (!response.ok) throw rejected(response.status);
    if (response.status !== 200 && response.status !== 202) throw new BackendAdapterError("INVALID_RESPONSE", "Unexpected sync status.", response.status);
    return { summary: await parseJsonResponse(response, parseDriveSyncSummary), upstreamStatus: response.status };
  }

  public async status(syncId: string): Promise<DriveSyncStatus | null> {
    if (!this.stateEnabled) throw stateUnavailable();
    const response = await requestResponse(this.fetcher, resource(this.endpoint, this.statusPath, syncId), {
      method: "GET", headers: { accept: "application/json" },
    }, this.options);
    if (response.status === 404) return null;
    if (!response.ok) throw rejected(response.status);
    return parseJsonResponse(response, parseDriveSyncStatus);
  }

  public async retry(syncId: string): Promise<DriveSyncStatus> {
    if (!this.stateEnabled) throw stateUnavailable();
    const response = await requestResponse(this.fetcher, resource(this.endpoint, this.retryPath, syncId), {
      method: "POST", headers: { accept: "application/json" },
    }, this.options);
    if (!response.ok) throw rejected(response.status);
    return parseJsonResponse(response, parseDriveSyncStatus);
  }
}

function stateUnavailable(): BackendAdapterError {
  return new BackendAdapterError("FAILED_DEPENDENCY", "FastAPI no publica estado/reintento persistido por sync_id.", 424);
}

function rejected(status: number): BackendAdapterError {
  return new BackendAdapterError(failureForStatus(status), "Import backend request failed.", status);
}

function resource(endpoint: string, path: string, id: string): string {
  const encoded = encodeURIComponent(id);
  const resolved = path.replace("{id}", encoded).replace(":id", encoded);
  return joinEndpoint(endpoint, resolved.includes(encoded) ? resolved : `${resolved}/${encoded}`);
}
