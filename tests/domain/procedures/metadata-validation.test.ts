import { describe, expect, it } from "vitest";
import { normalizeProcedure, validateProcedure } from "@/backend/domain/procedures/validate-procedure";

describe("procedure metadata validation", () => {
  it("reports all invalid metadata errors together", () => {
    const errors = validateProcedure({
      title: " ", code: "c".repeat(61), area: "a".repeat(121), description: "d".repeat(5001),
      filename: null, pdfUrl: "http://files.test/p.pdf", youtubeVideoId: "invalid",
    });

    expect(errors).toHaveLength(6);
    expect(errors.join(" ")).toContain("El PDF debe publicarse en una URL https.");
    expect(errors.join(" ")).toContain("El link de YouTube no es valido.");
  });

  it("trims metadata and keeps the normalized video ID public", () => {
    expect(normalizeProcedure({
      title: "  Trabajo seguro  ", code: " P-1 ", area: " Altura ", description: "  Texto ",
      filename: " p.pdf ", pdfUrl: " https://files.test/p.pdf ", youtubeVideoId: "dQw4w9WgXcQ",
    })).toEqual({
      title: "Trabajo seguro", code: "P-1", area: "Altura", description: "Texto",
      filename: "p.pdf", pdfUrl: "https://files.test/p.pdf", youtubeVideoId: "dQw4w9WgXcQ",
    });
  });
});
