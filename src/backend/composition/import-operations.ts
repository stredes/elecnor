import { HttpDriveImportGateway } from "../adapters/outbound/http-drive-import-gateway";
import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import type { DriveImportGateway } from "../ports/drive-import-gateway";
import { resolveBackendSelection } from "./backend-config";

export function createDriveImportGateway(fetcher?: typeof fetch): DriveImportGateway {
  const selection = resolveBackendSelection();
  if (selection.mode === "http" && selection.url) return new HttpDriveImportGateway(
    selection.url, fetcher ?? fetch, selection.paths.driveSync, selection.paths.driveSyncStatus,
    selection.paths.driveSyncRetry, { contractVersion: selection.driveContractVersion, internalToken: selection.internalToken, timeoutMs: selection.timeoutMs }, selection.driveSyncStateEnabled,
  );
  return unavailable(selection.error);
}

function unavailable(error?: Error): DriveImportGateway {
  const failure = error ?? new BackendConfigurationError("El backend de importación no está configurado.");
  return { sync: async () => { throw failure; }, status: async () => { throw failure; }, retry: async () => { throw failure; } };
}

export const driveImportGateway = createDriveImportGateway();
