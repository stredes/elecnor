import { describe, expect, it } from "vitest";
import type { Procedure } from "@/backend/domain/procedures/procedure-contract";
import { groupProcedureFamilies } from "@/backend/domain/procedures/group-procedure-families";

describe("procedure families", () => {
  it("groups by code and title, then orders variants by Spanish area", () => {
    const families = groupProcedureFamilies([
      procedure("p-1", "P-2", "Trabajo", "Área 10", true),
      procedure("p-2", "P-2", "Trabajo", "Altura 2", false),
      procedure("p-3", "P-10", "Trabajo", null, true),
      procedure("p-4", null, "Trabajo", "Charla", false),
    ]);

    expect(families.map((family) => family.code)).toEqual(["", "P-2", "P-10"]);
    expect(families[1]?.procedures.map((item) => item.area)).toEqual(["Altura 2", "Área 10"]);
    expect(families[1]?.conVideo).toBe(1);
  });
});

function procedure(id: string, code: string | null, title: string, area: string | null, video: boolean): Procedure {
  return {
    id, code, title, area, description: null, youtubeVideoId: video ? "dQw4w9WgXcQ" : null,
    pdfUrl: "https://files.test/p.pdf", filename: "p.pdf", createdAt: "2026-01-01", updatedAt: "2026-01-01",
  };
}
