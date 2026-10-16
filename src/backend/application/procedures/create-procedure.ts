import type { Procedure } from "../../domain/procedures/procedure-contract";
import { normalizeProcedure, validateProcedure } from "../../domain/procedures/validate-procedure";
import type { CreateProcedureCommand } from "../../domain/procedures/create-procedure-contract";
import { ProcedureCommitError, type CommitProcedure, type ProcedureReservation } from "../../ports/procedures/commit-procedure";
import type { RecordProcedureRecovery } from "../../ports/procedures/record-recovery";
import { DocumentStorageError, type StoreProcedureDocument } from "../../ports/procedures/store-document";
import type { ValidateProcedurePdf } from "../../ports/procedures/validate-pdf";
import { ProcedureCreationError } from "./procedure-creation-error";

export type CreateProcedureResult = { readonly status: "CREATED" | "DUPLICATE"; readonly procedure: Procedure };
export type CreateProcedureDependencies = {
  readonly validator: ValidateProcedurePdf;
  readonly storage: StoreProcedureDocument;
  readonly committer: CommitProcedure;
  readonly recovery: RecordProcedureRecovery;
};

export class CreateProcedure {
  public constructor(private readonly dependencies: CreateProcedureDependencies) {}

  public async execute(command: CreateProcedureCommand): Promise<CreateProcedureResult> {
    const errors = validateProcedure(command.metadata);
    if (errors.length) throw new ProcedureCreationError("INVALID_METADATA", errors.join(" "));
    let validation;
    try { validation = await this.dependencies.validator.validate(command.upload); }
    catch { throw new ProcedureCreationError("VALIDATOR_UNAVAILABLE"); }
    if (!validation.valid) throw new ProcedureCreationError(validationError(validation.code));
    const reservation = await this.dependencies.committer.reserve(command.idempotencyKey, command.payloadFingerprint);
    if (reservation.kind === "DUPLICATE") return { status: "DUPLICATE", procedure: reservation.procedure };
    if (reservation.kind === "CONFLICT") throw new ProcedureCreationError("CONFLICT");
    return this.storeAndCommit(command, reservation);
  }

  private async storeAndCommit(command: CreateProcedureCommand, reservation: ProcedureReservation & { readonly kind: "NEW" }): Promise<CreateProcedureResult> {
    let document;
    try { document = await this.dependencies.storage.put(command.upload, reservation.reservationId); }
    catch (error) {
      await this.compensateStorage(command, reservation, error);
      throw error;
    }
    try {
      const metadata = normalizeProcedure(command.metadata);
      const procedure = await this.dependencies.committer.commit(reservation, { metadata, document });
      return { status: "CREATED", procedure };
    } catch (error) {
      await this.compensateCommit(command, reservation, document, error);
      throw error;
    }
  }

  private async compensateStorage(command: CreateProcedureCommand, reservation: ProcedureReservation & { readonly kind: "NEW" }, error: unknown): Promise<void> {
    if (!(error instanceof DocumentStorageError) || error.state === "unknown") {
      await this.dependencies.recovery.record({ idempotencyKey: command.idempotencyKey, reservationId: reservation.reservationId, documentId: null, reason: "STORAGE_UNCERTAIN" });
      return;
    }
    await this.releaseReservation(command, reservation, null);
  }

  private async compensateCommit(command: CreateProcedureCommand, reservation: ProcedureReservation & { readonly kind: "NEW" }, document: Awaited<ReturnType<StoreProcedureDocument["put"]>>, error: unknown): Promise<void> {
    if (isUnknownCommit(error)) {
      await this.dependencies.recovery.record({ idempotencyKey: command.idempotencyKey, reservationId: reservation.reservationId, documentId: document?.id ?? null, reason: "COMMIT_UNCERTAIN" });
      return;
    }
    if (document) {
      try { await this.dependencies.storage.remove(document); }
      catch { await this.dependencies.recovery.record({ idempotencyKey: command.idempotencyKey, reservationId: reservation.reservationId, documentId: document.id, reason: "CLEANUP_FAILED" }); }
    }
    await this.releaseReservation(command, reservation, document?.id ?? null);
  }

  private async releaseReservation(command: CreateProcedureCommand, reservation: ProcedureReservation & { readonly kind: "NEW" }, documentId: string | null): Promise<void> {
    try { await this.dependencies.committer.cancel(reservation); }
    catch { await this.dependencies.recovery.record({ idempotencyKey: command.idempotencyKey, reservationId: reservation.reservationId, documentId, reason: "RESERVATION_RELEASE_FAILED" }); }
  }
}

function validationError(code: "INVALID_PDF" | "TOO_LARGE" | "UNAVAILABLE"): "INVALID_PDF" | "TOO_LARGE" | "VALIDATOR_UNAVAILABLE" {
  return code === "UNAVAILABLE" ? "VALIDATOR_UNAVAILABLE" : code;
}

function isUnknownCommit(error: unknown): boolean {
  return error instanceof ProcedureCommitError && error.state === "unknown";
}
