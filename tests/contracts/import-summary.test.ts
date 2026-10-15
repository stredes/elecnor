import { describe, expect, it } from "vitest";
import {
  ImportContractError,
  parseImportSummary,
} from "@/backend/adapters/inbound/import-summary";

const VALID_SUMMARY = {
  seleccionados: 2,
  procesados: 1,
  duplicados: 0,
  errores: 1,
  inspecciones_nuevas: 1,
  metricas_insertadas: 4,
  metricas_sin_clasificar: 2,
};

describe("NP-0028/AC-02/TEST-02 C-IMPORT response contract", () => {
  it("accepts the seven non-negative integer counters", () => {
    expect(parseImportSummary(VALID_SUMMARY)).toEqual(VALID_SUMMARY);
  });

  it.each([
    ["missing counter", { ...VALID_SUMMARY, errores: undefined }],
    ["string counter", { ...VALID_SUMMARY, procesados: "1" }],
    ["negative counter", { ...VALID_SUMMARY, duplicados: -1 }],
    ["fractional counter", { ...VALID_SUMMARY, errores: 0.5 }],
    ["extra field", { ...VALID_SUMMARY, unexpected: 1 }],
  ])("rejects %s", (_caseName, payload) => {
    expect(() => parseImportSummary(payload)).toThrow(ImportContractError);
  });
});
