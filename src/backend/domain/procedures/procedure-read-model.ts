import type {
  Procedure,
  ProcedureCatalogResult,
  ProcedureDetail,
  ProcedureFamily,
} from "./procedure-contract";

export const EXCLUDED_PROCEDURE_ID = "06-PEX";
export const EXCLUDED_PROCEDURE_TITLE = "Trabajos en Espacios Confinados";
const PROCEDURE_VIDEO_OVERRIDES: Readonly<Record<string, string>> = {
  "01-PEX": "jOotKdcX7I8",
  "01-ATC": "uFodyNmmzL0",
  "02-PEX": "IrEDXKREe9g",
  "02-ATC": "IrEDXKREe9g",
  "03-ATC": "P6s0B2hIYgo",
  "04-ATC": "xCHzXu5-b7A",
  "05-ATC": "RtXz4TpMLU4",
  "07-ATC": "iDT1cI_y0Eg",
  "08-ATC": "9WWYPBSLO2Y",
  "09-ATC": "Y0rE7nEwhMg",
  "10-ATC": "AYCdu3U15M0",
  "11-ATC": "cUuxaSXEgk4",
  "12-PEX": "xmN4DZuZB7s",
  "12-ATC": "xmN4DZuZB7s",
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
  const projectedProcedures = procedures.map(projectProcedure);

  return {
    ...family,
    code: displayCode(family.code) ?? family.code,
    procedures: projectedProcedures,
    total: procedures.length,
    conVideo: projectedProcedures.filter((procedure) => Boolean(procedure.youtubeVideoId)).length,
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
