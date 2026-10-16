import { describe, expect, it } from "vitest";
import {
  CExtractContractError,
  parseCExtractDocument,
} from "@/backend/domain/c-extract-contract";
import { validCExtractDocument } from "./c-extract-fixtures";

describe("C-EXTRACT v1.0.0 candidate contract", () => {
  it("accepts synthetic partial dates, nulls and explicit section order", () => {
    const document = parseCExtractDocument(validCExtractDocument);

    expect(document.contract_version).toBe("1.0.0");
    expect(document.date).toEqual({ year: 2026, month: 3, day: null });
    expect(document.sections[0].index).toBe(0);
    expect(document.sections[0].items[0].page).toBe(1);
  });

  it("rejects incompatible versions, unknown persistence fields and broken order", () => {
    expect(() => parseCExtractDocument({ ...validCExtractDocument, contract_version: "2.0.0" }))
      .toThrow(CExtractContractError);
    expect(() => parseCExtractDocument({ ...validCExtractDocument, stored_path: "/tmp/a.pdf" }))
      .toThrow(CExtractContractError);
    expect(() => parseCExtractDocument({
      ...validCExtractDocument,
      sections: [{ ...validCExtractDocument.sections[0], index: 1 }],
    })).toThrow(CExtractContractError);
  });

  it("requires a source when coordinates or rubric meaning are present", () => {
    expect(() => parseCExtractDocument({
      ...validCExtractDocument,
      location: { city: null, region: null, latitude: -33, longitude: -70, source: null },
    })).toThrow(CExtractContractError);
    expect(() => parseCExtractDocument({
      ...validCExtractDocument,
      rubric: { name: "Mitti", version: null, source: null },
    })).toThrow(CExtractContractError);
  });
});
