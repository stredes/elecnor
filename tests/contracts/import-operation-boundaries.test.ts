import { describe, expect, it, vi } from "vitest";
import { ImportInspection } from "@/backend/application/import-inspection";
import { InterpretDocument } from "@/backend/application/interpret-document";
import { catalogDefinitions } from "@/backend/domain/catalog/catalog-data";
import { ImportOperationError } from "@/backend/domain/import-operation-error";
import { validateImportContext } from "@/backend/domain/import-operation-context";
import type { DocumentProcessor } from "@/backend/ports/document-processor";
import type { ImportRepository } from "@/backend/ports/import-repository";
import { validImportFacts } from "./import-fixtures";

function context(cancellation = { isCancelled: () => false }) {
  return { requestId: "request-synthetic-2", cancellation };
}

function useCase(processor: DocumentProcessor, repository: ImportRepository) {
  return new ImportInspection(
    processor,
    new InterpretDocument({ list: () => catalogDefinitions }, { digest: (value) => value }),
    repository,
  );
}

describe("NP-0033/AC-02/TEST-02 import operation boundaries", () => {
  it("rejects an operation without an authorized request id", () => {
    expect(() => validateImportContext({
      requestId: "",
    })).toThrow();
  });

  it("continues after a document error and never persists missing metrics", async () => {
    const processor = vi.fn()
      .mockResolvedValueOnce({ ...validImportFacts, metrics: [] })
      .mockResolvedValueOnce(validImportFacts);
    const repository = { persist: vi.fn().mockResolvedValue({
      status: "CREATED", metricsInserted: 1, unknownMetrics: 0,
    }) };

    const summary = await useCase({ process: processor }, repository).execute([
      { name: "invalid.pdf", size: 10 }, { name: "valid.pdf", size: 10 },
    ], context());

    expect(summary).toMatchObject({ seleccionados: 2, errores: 1, procesados: 1 });
    expect(repository.persist).toHaveBeenCalledTimes(1);
  });

  it("cancels before persistence and exposes the processed partial summary", async () => {
    let cancelled = false;
    const processor = vi.fn(async () => {
      cancelled = true;
      return validImportFacts;
    });
    const repository = { persist: vi.fn() };

    await expect(useCase({ process: processor }, repository).execute(
      [{ name: "late.pdf", size: 10 }], context({ isCancelled: () => cancelled })),
    ).rejects.toMatchObject({
      code: "CANCELLED",
      summary: { seleccionados: 1, procesados: 0, errores: 0 },
    });
    expect(repository.persist).not.toHaveBeenCalled();
    expect(ImportOperationError).toBeDefined();
  });
});
