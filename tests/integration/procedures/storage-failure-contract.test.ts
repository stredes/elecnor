import { describe, expect, it } from "vitest";
import { CreateProcedure } from "@/backend/application/procedures/create-procedure";
import { DocumentStorageError } from "@/backend/ports/procedures/store-document";
import {
  MemoryProcedureCommitter,
  MemoryProcedureRecovery,
  MemoryPdfValidator,
} from "@/backend/adapters/outbound/memory-procedure-creation";

const upload = { filename: "scan.pdf", sizeBytes: 10, contentType: "application/pdf", open: async function* () {} };

describe("NP-0039/AC-02/TEST-07 storage failure contract", () => {
  it("maps known storage absence to a safe application error", async () => {
    const storage = {
      put: async () => { throw new DocumentStorageError("not_written"); },
      remove: async () => {},
    };
    const recovery = new MemoryProcedureRecovery();
    const useCase = new CreateProcedure({
      validator: new MemoryPdfValidator(), storage,
      committer: new MemoryProcedureCommitter(), recovery,
    });

    await expect(useCase.execute({
      idempotencyKey: "storage-unavailable", payloadFingerprint: "fingerprint",
      metadata: { title: "Sintético", filename: upload.filename }, upload,
    })).rejects.toMatchObject({ code: "STORAGE_UNAVAILABLE" });
    expect(recovery.records).toHaveLength(0);
  });
});
