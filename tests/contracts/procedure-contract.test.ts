import { describe, expect, it } from "vitest";
import { parseProcedureCatalog, parseProcedureDetail } from "@/backend/domain/procedures/procedure-parser";

const procedure = {
  id: "P-1", title: "Trabajo seguro", code: "PTS-01", area: "ATC",
  description: null, youtubeVideoId: null, filename: "p-1.pdf",
  createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z",
};

describe("procedure read contract", () => {
  it("accepts the FastAPI read model without a PDF path", () => {
    const result = parseProcedureCatalog({
      families: [{ code: "PTS-01", title: "Trabajo seguro", procedures: [procedure], total: 1, conVideo: 0 }],
      total: 1,
      filters: { q: "", area: "" },
    });

    expect(result.families[0].procedures[0].pdfUrl).toBeNull();
  });

  it("keeps a missing detail PDF explicitly unavailable", () => {
    const result = parseProcedureDetail({ procedure, document_id: "DOC-1" });
    expect(result.pdfUrl).toBeNull();
    expect(result.documentId).toBe("DOC-1");
  });

  it("preserves a PDF path declared by the read model", () => {
    const result = parseProcedureDetail({ procedure: { ...procedure, pdfUrl: "/procedures/P-1.pdf" } });
    expect(result.pdfUrl).toBe("/procedures/P-1.pdf");
  });
});
