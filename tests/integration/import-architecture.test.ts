import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createImportInspection } from "@/backend/composition/import-inspection";
import { catalogDefinitions } from "@/backend/domain/catalog/catalog-data";
import type { DocumentProcessor } from "@/backend/ports/document-processor";
import type { ImportRepository } from "@/backend/ports/import-repository";
import { validImportFacts } from "../contracts/import-fixtures";

const root = process.cwd();

describe("NP-0033/AC-03/TEST-03 import architecture", () => {
  it("composes the application with injected synthetic adapters", async () => {
    const processor: DocumentProcessor = { process: async () => validImportFacts };
    const repository: ImportRepository = {
      persist: async () => ({ status: "CREATED", metricsInserted: 2, unknownMetrics: 0 }),
    };
    const command = createImportInspection({
      processor,
      repository,
      catalog: { list: () => catalogDefinitions },
      hash: { digest: (value) => value },
    });

    await expect(command.execute(
      [{ name: "synthetic.pdf", size: 10 }],
      { requestId: "test-03", cancellation: { isCancelled: () => false } },
    )).resolves.toMatchObject({ procesados: 1, inspecciones_nuevas: 1 });
  });

  it("keeps the active HTTP boundary and default import composition safe", () => {
    const route = readFileSync(`${root}/pages/api/import.ts`, "utf8");
    const composition = readFileSync(`${root}/src/backend/composition/import.ts`, "utf8");
    expect(route).toContain("importCommand");
    expect(route).not.toMatch(/(?:fetch|sqlite|database|process\.env)/i);
    expect(composition).toContain("DisabledImportGateway");
    expect(composition).not.toMatch(/(?:next|react|fetch|sqlite|database)/i);
  });
});
