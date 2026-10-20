import { describe, expect, it } from "vitest";
import { resolveBackendSelection } from "@/backend/composition/backend-config";

describe("backend selection contract", () => {
  it("keeps synthetic readers unavailable in production", () => {
    const selection = resolveBackendSelection({
      NODE_ENV: "production",
      BACKEND_USE_SYNTHETIC_DATA: "true",
    });

    expect(selection.mode).toBe("unavailable");
    expect(selection.contractVersion).toBe("c-legacy-inspections/1.0.0");
  });

  it("selects HTTP with the configured timeout and versioned routes", () => {
    const selection = resolveBackendSelection({
      NODE_ENV: "production",
      FASTAPI_API_URL: "https://fasapi.test/",
      BACKEND_TIMEOUT_MS: "2500",
      FASTAPI_CONTRACT_VERSION: "c-legacy-inspections/2.0.0",
    });

    expect(selection).toMatchObject({
      mode: "http",
      url: "https://fasapi.test",
      timeoutMs: 2500,
      contractVersion: "c-legacy-inspections/2.0.0",
      internalToken: null,
      driveSyncStateEnabled: false,
      documentDownloadEnabled: false,
      paths: { extract: "/api/v1/pdf/extract", metrics: "/api/v1/metrics", driveSync: "/api/v1/sync/drive", driveSyncStatus: "/api/v1/sync/drive/{id}", driveSyncRetry: "/api/v1/sync/drive/{id}/retry" },
    });
  });

  it("keeps the internal FastAPI token server-side", () => {
    const selection = resolveBackendSelection({ NODE_ENV: "production", FASTAPI_API_URL: "https://fasapi.test", FASTAPI_INTERNAL_TOKEN: " secret " });
    expect(selection.internalToken).toBe("secret");
  });

  it("requires explicit capability publication before enabling sync state or document downloads", () => {
    const selection = resolveBackendSelection({ NODE_ENV: "production", FASTAPI_API_URL: "https://fasapi.test", BACKEND_DRIVE_SYNC_STATE_ENABLED: "true", BACKEND_DOCUMENT_DOWNLOAD_ENABLED: "true" });
    expect(selection).toMatchObject({ driveSyncStateEnabled: true, documentDownloadEnabled: true });
  });
});
