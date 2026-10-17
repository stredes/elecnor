import { describe, expect, it } from "vitest";
import { CreateProcedure } from "@/backend/application/procedures/create-procedure";
import { ProcedureCommitError } from "@/backend/ports/procedures/commit-procedure";
import { DocumentStorageError } from "@/backend/ports/procedures/store-document";
import {
  MemoryDocumentStorage,
  MemoryProcedureCommitter,
  MemoryProcedureRecovery,
  MemoryPdfValidator,
} from "@/backend/adapters/outbound/memory-procedure-creation";

const upload = { filename: "scan.pdf", sizeBytes: 10, contentType: "application/pdf", open: async function* () {} };
const command = (key: string, fingerprint = "same") => ({
  idempotencyKey: key, payloadFingerprint: fingerprint,
  metadata: { title: "Escaneado", filename: "scan.pdf" }, upload,
});

describe("NP-0039/AC-02/TEST-02 compensation contract", () => {
  it("cleans a stored document after a known commit failure", async () => {
    const storage = new MemoryDocumentStorage();
    const committer = new MemoryProcedureCommitter(new ProcedureCommitError("not_committed"));
    const recovery = new MemoryProcedureRecovery();
    const useCase = new CreateProcedure({ validator: new MemoryPdfValidator(), storage, committer, recovery });

    await expect(useCase.execute(command("known-failure"))).rejects.toBeInstanceOf(ProcedureCommitError);
    expect(storage.removed).toHaveLength(1);
    expect(recovery.records).toHaveLength(0);
  });

  it("records uncertain commit instead of silently deleting or retrying", async () => {
    const storage = new MemoryDocumentStorage();
    const committer = new MemoryProcedureCommitter(new ProcedureCommitError("unknown"));
    const recovery = new MemoryProcedureRecovery();
    const useCase = new CreateProcedure({ validator: new MemoryPdfValidator(), storage, committer, recovery });

    await expect(useCase.execute(command("uncertain"))).rejects.toBeInstanceOf(ProcedureCommitError);
    expect(storage.removed).toHaveLength(0);
    expect(recovery.records[0]?.reason).toBe("COMMIT_UNCERTAIN");
  });

  it("returns the prior procedure for the same idempotency key", async () => {
    const committer = new MemoryProcedureCommitter();
    const useCase = new CreateProcedure({ validator: new MemoryPdfValidator(), storage: new MemoryDocumentStorage(), committer, recovery: new MemoryProcedureRecovery() });

    await useCase.execute(command("retry"));
    const retry = await useCase.execute(command("retry"));

    expect(retry.status).toBe("DUPLICATE");
    expect(committer.records).toHaveLength(1);
  });

  it("records an uncertain storage write for reconciliation", async () => {
    const storage = {
      put: async () => { throw new DocumentStorageError("unknown"); },
      remove: async () => {},
    };
    const recovery = new MemoryProcedureRecovery();
    const useCase = new CreateProcedure({ validator: new MemoryPdfValidator(), storage, committer: new MemoryProcedureCommitter(), recovery });

    await expect(useCase.execute(command("storage-uncertain"))).rejects.toBeInstanceOf(DocumentStorageError);
    expect(recovery.records[0]?.reason).toBe("STORAGE_UNCERTAIN");
  });
});
