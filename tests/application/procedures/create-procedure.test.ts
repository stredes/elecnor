import { describe, expect, it } from "vitest";
import { CreateProcedure } from "@/backend/application/procedures/create-procedure";
import {
  MemoryDocumentStorage,
  MemoryProcedureCommitter,
  MemoryProcedureRecovery,
  MemoryPdfValidator,
} from "@/backend/adapters/outbound/memory-procedure-creation";

const command = (key = "request-1", fingerprint = "pdf-1") => ({
  idempotencyKey: key, payloadFingerprint: fingerprint,
  metadata: { title: "Trabajo en altura", filename: "altura.pdf" },
  upload: { filename: "altura.pdf", sizeBytes: 1024, contentType: "application/pdf", open: async function* () {} },
});

describe("NP-0039/AC-01/TEST-01 create procedure", () => {
  it("validates and commits through synthetic ports", async () => {
    const validator = new MemoryPdfValidator();
    const storage = new MemoryDocumentStorage();
    const committer = new MemoryProcedureCommitter();
    const useCase = new CreateProcedure({ validator, storage, committer, recovery: new MemoryProcedureRecovery() });

    const result = await useCase.execute(command());

    expect(result.status).toBe("CREATED");
    expect(committer.records).toHaveLength(1);
    expect(storage.documents).toHaveLength(1);
  });

  it("rejects an invalid PDF before storage", async () => {
    const validator = new MemoryPdfValidator({ valid: false, code: "INVALID_PDF" });
    const storage = new MemoryDocumentStorage();
    const useCase = new CreateProcedure({ validator, storage, committer: new MemoryProcedureCommitter(), recovery: new MemoryProcedureRecovery() });

    await expect(useCase.execute(command())).rejects.toMatchObject({ code: "INVALID_PDF" });
    expect(storage.documents).toHaveLength(0);
  });

  it("maps validator unavailability to a safe creation error", async () => {
    const validator = { validate: async () => { throw new Error("validator down"); } };
    const useCase = new CreateProcedure({ validator, storage: new MemoryDocumentStorage(), committer: new MemoryProcedureCommitter(), recovery: new MemoryProcedureRecovery() });

    await expect(useCase.execute(command())).rejects.toMatchObject({ code: "VALIDATOR_UNAVAILABLE" });
  });
});
