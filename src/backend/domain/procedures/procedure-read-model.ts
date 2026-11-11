import type {
  Procedure,
  ProcedureCatalogResult,
  ProcedureDetail,
  ProcedureFamily,
} from "./procedure-contract";

export const EXCLUDED_PROCEDURE_ID = "06-PEX";
export const EXCLUDED_PROCEDURE_TITLE = "Trabajos en Espacios Confinados";
const PROCEDURE_VIDEO_OVERRIDES: Readonly<Record<string, string>> = {
  "01-ATC": "uFodyNmmzL0",
  "08-ATC": "_t-J6Wbw3Ac",
};

export function isExcludedProcedure(procedure: Pick<Procedure, "id" | "title">): boolean {
  return procedure.id === EXCLUDED_PROCEDURE_ID || normalize(procedure.title) === normalize(EXCLUDED_PROCEDURE_TITLE);
}

export function isExcludedProcedureId(id: string): boolean {
  return id === EXCLUDED_PROCEDURE_ID;
}

export function projectProcedureCatalog(catalog: ProcedureCatalogResult): ProcedureCatalogResult {
  const families = catalog.families
    .map(projectFamily)
    .filter((family): family is ProcedureFamily => family !== null)
    .sort(compareFamilies);

  return {
    ...catalog,
    families,
    total: families.reduce((total, family) => total + family.total, 0),
  };
}

export function projectProcedureDetail(detail: ProcedureDetail): ProcedureDetail | null {
  if (isExcludedProcedure(detail.procedure)) return null;
  return { ...detail, procedure: projectProcedure(detail.procedure) };
}

function projectFamily(family: ProcedureFamily): ProcedureFamily | null {
  const procedures = family.procedures.filter((procedure) => !isExcludedProcedure(procedure));
  if (!procedures.length) return null;

  return {
    ...family,
    code: displayCode(family.code) ?? family.code,
    procedures: procedures.map(projectProcedure),
    total: procedures.length,
    conVideo: procedures.filter((procedure) => Boolean(procedure.youtubeVideoId)).length,
  };
}

function projectProcedure(procedure: Procedure): Procedure {
  return {
    ...procedure,
    code: displayCode(procedure.code),
    youtubeVideoId: PROCEDURE_VIDEO_OVERRIDES[procedure.id] ?? procedure.youtubeVideoId,
  };
}

function displayCode(code: string | null): string | null {
  const match = code?.match(/^PTS-(\d{1,2})$/i);
  if (!match) return code;
  const number = Number(match[1]);
  const visibleNumber = number >= 7 ? number - 1 : number;
  return `PTS-${String(visibleNumber).padStart(2, "0")}`;
}

function compareFamilies(left: ProcedureFamily, right: ProcedureFamily): number {
  const leftNumber = codeNumber(left.code);
  const rightNumber = codeNumber(right.code);
  return leftNumber - rightNumber || left.title.localeCompare(right.title, "es");
}

function codeNumber(code: string): number {
  const match = code.match(/^PTS-(\d{1,2})$/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("es-CL");
}
