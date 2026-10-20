import type { BackendConfigurationError } from "../adapters/outbound/http-errors";
import type { BackendPaths } from "./backend-paths-contract";

export type BackendMode = "http" | "memory" | "unavailable";
export type BackendSelection = {
  readonly mode: BackendMode;
  readonly url: string | null;
  readonly paths: BackendPaths;
  readonly contractVersion: string;
  readonly driveContractVersion: string;
  readonly internalToken: string | null;
  readonly driveSyncStateEnabled: boolean;
  readonly documentDownloadEnabled: boolean;
  readonly timeoutMs: number;
  readonly error?: BackendConfigurationError;
};
