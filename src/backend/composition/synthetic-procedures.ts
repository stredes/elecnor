import type { Procedure, ProcedureCatalogQuery, ProcedureCatalogResult, ProcedureDetail, ProcedureFamily } from "../domain/procedures/procedure-contract";

const first: Procedure = { id: "05-ATC", title: "Trabajo en Altura en Postación", code: "PTS-05", area: "ATC", description: "Medidas preventivas sintéticas.", youtubeVideoId: null, pdfUrl: "/synthetic/procedures/05-ATC.pdf", filename: "05-atc.pdf", createdAt: "2026-10-05T00:00:00Z", updatedAt: "2026-10-05T00:00:00Z" };
const second: Procedure = { ...first, id: "05-PEX", area: "PEX", youtubeVideoId: "synthetic-video", pdfUrl: "/synthetic/procedures/05-PEX.pdf", filename: "05-pex.pdf" };
const third: Procedure = { id: "10-ATC", title: "Trabajo en Fachada", code: "PTS-10", area: "ATC", description: null, youtubeVideoId: null, pdfUrl: "/synthetic/procedures/10-ATC.pdf", filename: "10-atc.pdf", createdAt: first.createdAt, updatedAt: first.updatedAt };
const families: readonly ProcedureFamily[] = [
  { code: "PTS-05", title: first.title, procedures: [first, second], total: 2, conVideo: 1 },
  { code: "PTS-10", title: third.title, procedures: [third], total: 1, conVideo: 0 },
];

const text = (value: string | undefined) => (value ?? "").trim().toLocaleLowerCase();
const matches = (procedure: Procedure, query: ProcedureCatalogQuery) => {
  const q = text(query.q);
  const area = text(query.area);
  const searchable = [procedure.title, procedure.code, procedure.description].filter(Boolean).join(" ").toLocaleLowerCase();
  return (!q || searchable.includes(q)) && (!area || text(procedure.area ?? "") === area);
};

function selectFamilies(query: ProcedureCatalogQuery): readonly ProcedureFamily[] {
  return families.map((family) => {
    const procedures = family.procedures.filter((procedure) => matches(procedure, query));
    return { ...family, procedures, total: procedures.length, conVideo: procedures.filter((procedure) => Boolean(procedure.youtubeVideoId)).length };
  }).filter((family) => family.procedures.length > 0);
}

export const syntheticProcedureCatalog = {
  execute: async (query: ProcedureCatalogQuery = {}): Promise<ProcedureCatalogResult> => {
    const selected = selectFamilies(query);
    return { families: selected, total: selected.reduce((total, family) => total + family.total, 0), filters: { q: query.q?.trim() ?? "", area: query.area?.trim() ?? "" } };
  },
};

export const syntheticProcedureDetail = {
  execute: async (id: string): Promise<ProcedureDetail | null> => {
    const procedure = families.flatMap((family) => family.procedures).find((candidate) => candidate.id === id);
    return procedure ? { procedure, pdfUrl: procedure.pdfUrl ?? `/synthetic/procedures/${encodeURIComponent(id)}.pdf`, video: { status: procedure.youtubeVideoId ? "pending-policy" : "unavailable" } } : null;
  },
};
