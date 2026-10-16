export type RecoveryReason = "STORAGE_UNCERTAIN" | "COMMIT_UNCERTAIN" | "CLEANUP_FAILED" | "RESERVATION_RELEASE_FAILED";
export type ProcedureRecoveryRecord = {
  readonly idempotencyKey: string;
  readonly reservationId: string;
  readonly documentId: string | null;
  readonly reason: RecoveryReason;
};

export interface RecordProcedureRecovery {
  record(event: ProcedureRecoveryRecord): Promise<void>;
}
