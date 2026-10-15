import { describe, expect, it } from "vitest";
import {
  NormalizedDocumentContractError,
  parseNormalizedDocument,
} from "@/backend/domain/normalized-document-contract";
import { mapFasapiDocument } from "@/backend/adapters/outbound/fasapi-document-mapper";
import { mapFlaskInspection } from "@/backend/adapters/outbound/flask-document-mapper";
import { fasapiRecord, flaskRecord } from "./normalized-document-fixtures";

describe("NP-0028/AC-03/TEST-03 normalized document boundary", () => {
  it("maps Flask fields without retaining a PDF path", () => {
    const document = mapFlaskInspection(flaskRecord);

    expect(document.source).toMatchObject({
      format: "flask-mitti",
      filename: "synthetic-a.pdf",
      sha256: "hash-synthetic-a",
    });
    expect(document.audit.location.city).toBe("Ciudad sintética");
    expect(document.audit.score?.percentageScale).toBe("fraction");
    expect(document.sections[0].items[0]).toMatchObject({
      label: "EPP sintético",
      state: "CONFORME",
      code: "SYN_EPP",
      applicable: 1,
    });
    expect(document.source).not.toHaveProperty("storedPath");
  });

  it("maps strict Fasapi data and keeps page evidence", () => {
    const document = mapFasapiDocument(fasapiRecord);

    expect(document.source.format).toBe("fasapi-mitti");
    expect(document.audit.title).toBe("Auditoría sintética");
    expect(document.audit.score?.percentageScale).toBe("percent");
    expect(document.sections[0].items[0]).toMatchObject({
      label: "Pregunta sintética",
      response: "Conforme",
      number: 1,
      page: 2,
    });
  });

  it("accepts mapped documents and rejects PDF persistence metadata", () => {
    const document = mapFlaskInspection(flaskRecord);

    expect(parseNormalizedDocument(document)).toEqual(document);
    expect(() => parseNormalizedDocument({ ...document, storedPath: "/tmp/a.pdf" }))
      .toThrow(NormalizedDocumentContractError);
  });
});
