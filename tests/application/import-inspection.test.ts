import { describe, expect, it, vi } from "vitest";
import { InterpretDocument } from "@/backend/application/interpret-document";
import { catalogDefinitions } from "@/backend/domain/catalog/catalog-data";
import { ImportInspection } from "@/backend/application/import-inspection";
import type { ImportDocumentResult } from "@/backend/ports/import-repository";
import type { ImportExecutionContext } from "@/backend/ports/import-operation";
import { validImportFacts } from "../contracts/import-fixtures";

const context: ImportExecutionContext = {
  requestId: "request-synthetic-1",
  cancellation: { isCancelled: () => false },
};

describe("NP-0033/AC-01/TEST-01 import inspection coordinator", () => {
  it("interprets each document and preserves the seven summary counters", async () => {
    const processor = { process: vi.fn(async () => validImportFacts) };
    const result: ImportDocumentResult = {
      status: "CREATED", metricsInserted: 3, unknownMetrics: 1,
    };
    const repository = { persist: vi.fn(async () => result) };
    const useCase = new ImportInspection(
      processor,
      new InterpretDocument({ list: () => catalogDefinitions }, { digest: (value) => value }),
      repository,
    );

    const summary = await useCase.execute([
      { name: "new.pdf", size: 10 },
      { name: "partial.pdf", size: 11 },
    ], context);

    expect(summary).toEqual({
      seleccionados: 2, procesados: 2, duplicados: 0, errores: 0,
      inspecciones_nuevas: 2, metricas_insertadas: 6, metricas_sin_clasificar: 2,
    });
    expect(processor.process).toHaveBeenCalledTimes(2);
    expect(repository.persist).toHaveBeenCalledTimes(2);
  });

  it("counts a duplicate without creating a new inspection", async () => {
    const processor = { process: vi.fn(async () => validImportFacts) };
    const repository = {
      persist: vi.fn(async () => ({
        status: "DUPLICATE" as const, metricsInserted: 0, unknownMetrics: 0,
      })),
    };
    const useCase = new ImportInspection(
      processor,
      new InterpretDocument({ list: () => catalogDefinitions }, { digest: (value) => value }),
      repository,
    );

    await expect(useCase.execute([{ name: "same.pdf", size: 10 }], context))
      .resolves.toMatchObject({ seleccionados: 1, duplicados: 1, inspecciones_nuevas: 0 });
  });
});
