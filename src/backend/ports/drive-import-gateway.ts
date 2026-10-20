import type { DriveSyncResult, DriveSyncStatus } from "../domain/import-operation-contract";

export type DriveSyncRequest = {
  readonly limit?: number;
  readonly retryOf?: string | null;
  readonly requestId?: string | null;
};

export interface DriveImportGateway {
  sync(request: DriveSyncRequest): Promise<DriveSyncResult>;
  status(syncId: string): Promise<DriveSyncStatus | null>;
  retry(syncId: string): Promise<DriveSyncStatus>;
}
