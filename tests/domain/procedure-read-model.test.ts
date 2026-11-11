import { describe, expect, it } from "vitest";
import type { ProcedureCatalogResult } from "@/backend/domain/procedures/procedure-contract";
import { projectProcedureCatalog, projectProcedureDetail } from "@/backend/domain/procedures/procedure-read-model";

const procedure = (id: string, code: string, title: string, youtubeVideoId: string | null = null) => ({
  id, title, code, area: "PEX", description: null, youtubeVideoId, pdfUrl: null,
  filename: `${id}.pdf`, createdAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-01T00:00:00Z",
});

const catalog: ProcedureCatalogResult = {
  families: [
    { code: "PTS-07", title: "Riesgos eléctricos", procedures: [procedure("07-PEX", "PTS-07", "Riesgos eléctricos")], total: 1, conVideo: 0 },
    { code: "PTS-06", title: "Trabajos en Espacios Confinados", procedures: [procedure("06-PEX", "PTS-06", "Trabajos en Espacios Confinados")], total: 1, conVideo: 0 },
    { code: "PTS-05", title: "Trabajo en Altura", procedures: [procedure("05-PEX", "PTS-05", "Trabajo en Altura")], total: 1, conVideo: 0 },
  ],
  total: 3,
  filters: { q: "", area: "" },
};

describe("procedure read model projection", () => {
  it("excludes spaces-confined work and keeps the visible catalog numbered", () => {
    const result = projectProcedureCatalog(catalog);

    expect(result.total).toBe(2);
    expect(result.families.map((family) => family.code)).toEqual(["PTS-05", "PTS-06"]);
    expect(result.families.flatMap((family) => family.procedures).map((item) => item.id)).not.toContain("06-PEX");
    expect(result.families[1].procedures[0].code).toBe("PTS-06");
  });

  it("does not expose the excluded procedure through the detail read model", () => {
    const hidden = catalog.families[1].procedures[0];
    expect(projectProcedureDetail({ procedure: hidden, pdfUrl: null })).toBeNull();
  });

  it("replaces the ATC driving procedure video in the read model", () => {
    const driving = procedure("01-ATC", "PTS-01", "Conducción de Vehículos");
    const result = projectProcedureCatalog({ families: [{ code: "PTS-01", title: driving.title, procedures: [driving], total: 1, conVideo: 0 }], total: 1, filters: { q: "", area: "" } });
    expect(result.families[0].procedures[0].youtubeVideoId).toBe("uFodyNmmzL0");
  });

  it("adds the Shaft ATC video through the read model", () => {
    const shaft = procedure("08-ATC", "PTS-08", "Trabajo en Shaft");
    const result = projectProcedureCatalog({ families: [{ code: "PTS-08", title: shaft.title, procedures: [shaft], total: 1, conVideo: 0 }], total: 1, filters: { q: "", area: "" } });
    expect(result.families[0].procedures[0].youtubeVideoId).toBe("_t-J6Wbw3Ac");
  });
});
