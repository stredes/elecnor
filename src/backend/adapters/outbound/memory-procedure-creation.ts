import type { Procedure } from "../../domain/procedures/procedure-contract";
import type { ProcedureUpload, ProcedureWriteDraft, StoredProcedureDocument } from "../../domain/procedures/create-procedure-contract";
import type { CommitProcedure, ProcedureReservation, ProcedureCommitError } from "../../ports/procedures/commit-procedure";
import type { PdfValidation, ValidateProcedurePdf } from "../../ports/procedures/validate-pdf";
import type { RecordProcedureRecovery, ProcedureRecoveryRecord } from "../../ports/procedures/record-recovery";
import type { StoreProcedureDocument } from "../../ports/procedures/store-document";

export class MemoryPdfValidator implements ValidateProcedurePdf {
  public constructor(private readonly result: PdfValidation = { valid: true, pages: 1 }) {}
  public validate(upload: ProcedureUpload): Promise<PdfValidation> { void upload; return Promise.resolve(this.result); }
}

export class MemoryDocumentStorage implements StoreProcedureDocument {
  public readonly documents: StoredProcedureDocument[] = [];
  public readonly removed: StoredProcedureDocument[] = [];
  public put(upload: ProcedureUpload, token: string): Promise<StoredProcedureDocument> {
    void token;
    const document = { id: `document-${this.documents.length + 1}`, filename: upload.filename };
    this.documents.push(document);
    return Promise.resolve(document);
  }
  public remove(document: StoredProcedureDocument): Promise<void> { this.removed.push(document); return Promise.resolve(); }
}

export class MemoryProcedureCommitter implements CommitProcedure {
  public readonly records: Procedure[] = [];
  private readonly completed = new Map<string, { fingerprint: string; procedure: Procedure }>();
  public constructor(private readonly failure?: ProcedureCommitError) {}
  public reserve(key: string, fingerprint: string): Promise<ProcedureReservation> {
    const existing = this.completed.get(key);
    if (existing) return Promise.resolve(existing.fingerprint === fingerprint ? { kind: "DUPLICATE", procedure: existing.procedure } : { kind: "CONFLICT" });
    return Promise.resolve({ kind: "NEW", token: `${key}-token` });
  }
  public commit(reservation: ProcedureReservation & { readonly kind: "NEW" }, draft: ProcedureWriteDraft): Promise<Procedure> {
    if (this.failure) return Promise.reject(this.failure);
    const procedure = { id: `procedure-${this.records.length + 1}`, title: draft.metadata.title ?? "", code: draft.metadata.code, area: draft.metadata.area, description: draft.metadata.description, youtubeVideoId: draft.metadata.youtubeVideoId, pdfUrl: null, filename: draft.document.filename, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    this.records.push(procedure);
    this.completed.set(reservation.token.replace(/-token$/, ""), { fingerprint: "same", procedure });
    return Promise.resolve(procedure);
  }
  public cancel(reservation: ProcedureReservation & { readonly kind: "NEW" }): Promise<void> { void reservation; return Promise.resolve(); }
}

export class MemoryProcedureRecovery implements RecordProcedureRecovery {
  public readonly records: ProcedureRecoveryRecord[] = [];
  public record(event: ProcedureRecoveryRecord): Promise<void> { this.records.push(event); return Promise.resolve(); }
}
