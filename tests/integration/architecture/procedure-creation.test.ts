import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CreateProcedure } from "@/backend/application/procedures/create-procedure";
import { MemoryDocumentStorage, MemoryProcedureCommitter, MemoryProcedureRecovery, MemoryPdfValidator } from "@/backend/adapters/outbound/memory-procedure-creation";

const root = process.cwd();
const pureFiles = [
  "src/backend/domain/procedures/create-procedure-contract.ts",
  "src/backend/application/procedures/create-procedure.ts",
  "src/backend/application/procedures/procedure-creation-error.ts",
  "src/backend/ports/procedures/validate-pdf.ts",
  "src/backend/ports/procedures/store-document.ts",
  "src/backend/ports/procedures/commit-procedure.ts",
  "src/backend/ports/procedures/record-recovery.ts",
];

describe("NP-0039/AC-03/TEST-03 synthetic creation boundaries", () => {
  it("keeps application and ports free of runtime adapters", () => {
    for (const file of pureFiles) {
      const source = readFileSync(`${root}/${file}`, "utf8");
      expect(source).not.toMatch(/(?:next|react|fetch|sqlite|sql|fastapi|blob|storage\/real)/i);
    }
  });

  it("does not compose the mutation before decisions are approved", () => {
    const composition = readFileSync(`${root}/src/backend/composition/procedures.ts`, "utf8");
    expect(composition).not.toContain("CreateProcedure");
    expect(composition).not.toMatch(/(?:Blob|sqlite|procedure-upload)/i);
  });

  it("keeps the payload fingerprint for a synthetic retry", async () => {
    const useCase = new CreateProcedure({ validator: new MemoryPdfValidator(), storage: new MemoryDocumentStorage(), committer: new MemoryProcedureCommitter(), recovery: new MemoryProcedureRecovery() });
    const command = { idempotencyKey: "retry-key", payloadFingerprint: "payload-hash", metadata: { title: "Sintético", filename: "scan.pdf" }, upload: { filename: "scan.pdf", sizeBytes: 10, contentType: "application/pdf", open: async function* () {} } };

    await useCase.execute(command);
    await expect(useCase.execute(command)).resolves.toMatchObject({ status: "DUPLICATE" });
  });
});
