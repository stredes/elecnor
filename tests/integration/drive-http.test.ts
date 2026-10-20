import { describe, expect, it } from "vitest";
import { DRIVE_CONTRACT_VERSION } from "@/backend/domain/backend-contract";
import { mapBackendError } from "@/backend/adapters/inbound/backend-error-response";
import { HttpDriveImportGateway } from "@/backend/adapters/outbound/http-drive-import-gateway";
import { BackendAdapterError } from "@/backend/adapters/outbound/http-errors";
import { json, SYNC_STATE, SYNC_SUMMARY } from "./helpers/fastapi-responses";

function stateGateway(fetcher: typeof fetch) {
  return new HttpDriveImportGateway(
    "https://fasapi.test",
    fetcher,
    "/api/v1/sync/drive",
    "/api/v1/sync/drive/{id}",
    "/api/v1/sync/drive/{id}/retry",
    { contractVersion: DRIVE_CONTRACT_VERSION, internalToken: "server-only-token" },
  );
}

describe("FastAPI-aligned Drive sync BFF HTTP adapters", () => {
  it("accepts 202, sends retry correlation as X-Request-Id and keeps the token server-side", async () => {
    let url = "";
    let headers: Headers | undefined;
    const gateway = stateGateway(async (input, init) => {
      url = String(input);
      headers = new Headers(init?.headers);
      return json(SYNC_SUMMARY, 202);
    });

    await expect(gateway.sync({ limit: 20, retryOf: "SYNC-0" })).resolves.toMatchObject({
      upstreamStatus: 202,
      summary: { syncId: "SYNC-1" },
    });
    expect(url).toContain("/api/v1/sync/drive?limit=20");
    expect(headers?.get("X-Request-Id")).toBe("SYNC-0");
    expect(headers?.get("X-Fasapi-Internal-Token")).toBe("server-only-token");
    expect(headers?.get("X-Fasapi-Contract-Version")).toBe(DRIVE_CONTRACT_VERSION);
  });

  it("handles 404 sync state and retries the same persisted sync id", async () => {
    const gateway = new HttpDriveImportGateway("https://fasapi.test", async (url, init) => {
      if (String(url).endsWith("/SYNC-404")) return json({}, 404);
      expect(String(url)).toContain("/api/v1/sync/drive/SYNC-1/retry");
      expect(init?.method).toBe("POST");
      return json(SYNC_STATE);
    });
    await expect(gateway.status("SYNC-404")).resolves.toBeNull();
    await expect(gateway.retry("SYNC-1")).resolves.toMatchObject({ syncId: "SYNC-1", status: "PARTIAL" });
  });

  it("blocks sync state when the PostgreSQL-backed capability is not published", async () => {
    const gateway = new HttpDriveImportGateway("https://fasapi.test", async () => { throw new Error("must not call unavailable state"); }, undefined, undefined, undefined, {}, false);
    await expect(gateway.status("SYNC-1")).rejects.toMatchObject({ code: "FAILED_DEPENDENCY", status: 424 });
    await expect(gateway.retry("SYNC-1")).rejects.toMatchObject({ code: "FAILED_DEPENDENCY", status: 424 });
  });

  it.each([409, 424, 502, 503])("maps upstream HTTP %s without leaking its body", async (status) => {
    const gateway = stateGateway(async () => json({ detail: "secret backend detail" }, status));
    await expect(gateway.sync({ limit: 1 })).rejects.toMatchObject({ status, code: status === 409 ? "CONFLICT" : status === 424 ? "FAILED_DEPENDENCY" : "UNAVAILABLE" });
    const mapped = mapBackendError(new BackendAdapterError(status === 409 ? "CONFLICT" : status === 424 ? "FAILED_DEPENDENCY" : "UNAVAILABLE", "secret", status));
    expect(mapped.status).toBe(status);
    expect(JSON.stringify(mapped.body)).not.toContain("secret");
  });
});
