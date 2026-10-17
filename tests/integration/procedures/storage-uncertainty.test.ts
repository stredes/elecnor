import { describe, expect, it } from "vitest";
import { CreateProcedure } from "@/backend/application/procedures/create-procedure";
import {
  MemoryProcedureCommitter,
  MemoryProcedureRecovery,
  MemoryPdfValidator,
} from "@/backend/adapters/outbound/memory-procedure-creation";

const upload = { filename: "scan.pdf", sizeBytes: 10, contentType: "application/pdf", open: async function* () {} };

describe("NP-0039/AC-02/TEST-06 storage uncertainty", () => {
  it("records an untyped storage failure as uncertain", async () => {
    const storage = {
      put: async () => { throw new Error("storage connection reset"); },
      remove: async () => {},
    };
    const recovery = new MemoryProcedureRecovery();
    const useCase = new CreateProcedure({
      validator: new MemoryPdfValidator(), storage,
      committer: new MemoryProcedureCommitter(), recovery,
    });

    await expect(useCase.execute({
      idempotencyKey: "untyped-storage", payloadFingerprint: "fingerprint",
      metadata: { title: "Sintético", filename: upload.filename }, upload,
    })).rejects.toThrow("storage connection reset");
    expect(recovery.records[0]?.reason).toBe("STORAGE_UNCERTAIN");
  });
});
