import type { Procedure, ProcedureList } from "./procedure-contract";

export class ProcedureContractError extends Error {
  public constructor() {
    super("Respuesta de procedimientos inválida.");
    this.name = "ProcedureContractError";
  }
}

export function parseProcedureList(value: unknown): ProcedureList {
  if (!record(value) || !Array.isArray(value.data) || !integer(value.total)) throw new ProcedureContractError();
  try { return { total: value.total, data: value.data.map(parseProcedure) }; }
  catch { throw new ProcedureContractError(); }
}

export function parseProcedure(value: unknown): Procedure {
  if (!record(value)) throw new ProcedureContractError();
  const result = {
    id: value.id, title: value.title, code: value.code, area: value.area, description: value.description,
    youtubeVideoId: value.youtube_video_id, pdfUrl: value.pdf_url, filename: value.filename,
    createdAt: value.created_at, updatedAt: value.updated_at,
  };
  if (!strings(result.id, result.title, result.filename, result.createdAt, result.updatedAt)) throw new ProcedureContractError();
  if (![result.code, result.area, result.description, result.youtubeVideoId, result.pdfUrl].every(nullableString)) throw new ProcedureContractError();
  return result as Procedure;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function strings(...values: unknown[]): boolean {
  return values.every((value) => typeof value === "string");
}

function nullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}

function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
