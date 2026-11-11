import { describe, expect, it } from "vitest";
import { resolveBackendSelection, resolveInspectionBackendSelection } from "@/backend/composition/backend-config";

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

  it("routes inspection readers through their dedicated read-only configuration", () => {
    const env: NodeJS.ProcessEnv = {
      NODE_ENV: "production",
      FASTAPI_API_URL: "https://global-backend.test",
      FASTAPI_INTERNAL_TOKEN: "global-secret",
      BACKEND_INSPECTIONS_PATH: "/global/inspections",
      INSPECTIONS_API_URL: "https://inspection-backend.test/elecnor/",
      INSPECTIONS_INTERNAL_TOKEN: " inspection-secret ",
      INSPECTIONS_TIMEOUT_MS: "3500",
      INSPECTIONS_DOCUMENT_DOWNLOAD_ENABLED: "true",
    };

    const inspectionSelection = resolveInspectionBackendSelection(env);
    const globalSelection = resolveBackendSelection(env);

    expect(inspectionSelection).toMatchObject({
      mode: "http",
      url: "https://inspection-backend.test/elecnor",
      internalToken: "inspection-secret",
      timeoutMs: 3500,
      documentDownloadEnabled: true,
      paths: { inspections: "/api/v1/inspections", dashboard: "/api/v1/dashboard" },
    });
    expect(globalSelection.url).toBe("https://global-backend.test");
    expect(globalSelection.internalToken).toBe("global-secret");
  });

  it("fails closed in production when the dedicated inspection origin is disabled or missing", () => {
    expect(resolveInspectionBackendSelection({
      NODE_ENV: "production",
      FASTAPI_API_URL: "https://global-backend.test",
      INSPECTIONS_API_URL: "disabled://privacy-review",
      INSPECTIONS_INTERNAL_TOKEN: "inspection-secret",
    }).mode).toBe("unavailable");

    expect(resolveInspectionBackendSelection({
      NODE_ENV: "production",
      FASTAPI_API_URL: "https://global-backend.test",
      INSPECTIONS_INTERNAL_TOKEN: "inspection-secret",
    }).mode).toBe("unavailable");
  });

  it("requires explicit capability publication before enabling sync state or document downloads", () => {
    const selection = resolveBackendSelection({ NODE_ENV: "production", FASTAPI_API_URL: "https://fasapi.test", BACKEND_DRIVE_SYNC_STATE_ENABLED: "true", BACKEND_DOCUMENT_DOWNLOAD_ENABLED: "true" });
    expect(selection).toMatchObject({ driveSyncStateEnabled: true, documentDownloadEnabled: true });
  });
});
