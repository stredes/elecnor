import { describe, expect, it } from "vitest";
import { InterpretDocument } from "@/backend/application/interpret-document";
import { catalogDefinitions } from "@/backend/domain/catalog/catalog-data";
import { ImportInterpretationError } from "@/backend/domain/import-errors";
import type { ExtractedInspectionFacts } from "@/backend/domain/import-facts-contract";
import { determineImportStatus } from "@/backend/domain/determine-import-status";
import { validImportFacts } from "./import-fixtures";

const interpreter = new InterpretDocument(
  { list: () => catalogDefinitions },
  { digest: (value) => `hash:${value}` },
);

describe("NP-0032/AC-02/TEST-02 missing import evidence", () => {
  it("uses the completeness policy without deriving missing headers", () => {
    expect(determineImportStatus(validImportFacts)).toBe("COMPLETA");
    expect(determineImportStatus({ ...validImportFacts, technician: null }))
      .toBe("PARCIAL");
  });

  it("keeps unknown flags null and excludes NA from applicable counts", () => {
    const draft = interpreter.execute(validImportFacts);
    expect(draft.metrics[1]).toMatchObject({
      state: "NA", applicable: 0, conforming: 0, nonConforming: 0, notApplicable: 1,
    });
    expect(draft.metrics[2]).toMatchObject({
      state: "DESCONOCIDO", applicable: null, conforming: null,
      nonConforming: null, notApplicable: null,
    });
  });

  it("marks missing headers partial without inventing dates or percentages", () => {
    const facts: ExtractedInspectionFacts = {
      ...validImportFacts, technician: null, inspectionDate: null,
      score: { obtained: 20, maximum: 24, percentage: null },
    };
    const draft = interpreter.execute(facts);
    expect(draft.status).toBe("PARCIAL");
    expect(draft.inspectionDate).toBeNull();
    expect(draft.score?.percentage).toBeNull();
    expect(draft.logicalKey).toBeNull();
  });

  it("rejects a document without metrics", () => {
    expect(() => interpreter.execute({ ...validImportFacts, metrics: [] }))
      .toThrowError(ImportInterpretationError);
  });
});
