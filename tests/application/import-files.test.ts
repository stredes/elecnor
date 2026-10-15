import { describe, expect, it, vi } from "vitest";
import { ImportFiles } from "@/backend/application/import-files";
import type { ImportSummary } from "@/backend/adapters/inbound/import-summary";

const summary: ImportSummary = {
  seleccionados: 1,
  procesados: 1,
  duplicados: 0,
  errores: 0,
  inspecciones_nuevas: 1,
  metricas_insertadas: 2,
  metricas_sin_clasificar: 0,
};

describe("NP-0028/AC-02/TEST-06 import application use case", () => {
  it("validates files before delegating to the gateway", async () => {
    const gateway = { execute: vi.fn().mockResolvedValue(summary) };
    const useCase = new ImportFiles(gateway);

    await expect(useCase.execute([{ name: "audit.pdf", size: 10 }])).resolves.toEqual(summary);
    expect(gateway.execute).toHaveBeenCalledWith([{ name: "audit.pdf", size: 10 }]);
  });

  it("does not call the gateway for an invalid selection", async () => {
    const gateway = { execute: vi.fn() };
    const useCase = new ImportFiles(gateway);

    await expect(useCase.execute([])).rejects.toThrow("Selecciona al menos un PDF.");
    expect(gateway.execute).not.toHaveBeenCalled();
  });
});
