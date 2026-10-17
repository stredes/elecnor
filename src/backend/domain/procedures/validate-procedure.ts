import { parseYoutubeId } from "./parse-youtube-id";

export const MAX_TITLE_LENGTH = 200;
export const MAX_CODE_LENGTH = 60;
export const MAX_AREA_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 5000;

export type NormalizedProcedure = {
  readonly title: string | null;
  readonly code: string | null;
  readonly area: string | null;
  readonly description: string;
  readonly youtubeVideoId: string | null;
  readonly filename: string | null;
  readonly pdfUrl: string | null;
};

export function validateProcedure(value: unknown): string[] {
  const payload = record(value);
  const errors: string[] = [];
  const title = text(payload?.title, "title", errors);
  if (!title) errors.push("El titulo es obligatorio.");
  else if (title.length > MAX_TITLE_LENGTH) errors.push(`El titulo no puede superar ${MAX_TITLE_LENGTH} caracteres.`);
  const description = text(payload?.description, "description", errors) ?? "";
  validateLength(errors, "description", description, MAX_DESCRIPTION_LENGTH);
  validateLength(errors, "code", text(payload?.code, "code", errors), MAX_CODE_LENGTH);
  validateLength(errors, "area", text(payload?.area, "area", errors), MAX_AREA_LENGTH);
  const filename = text(payload?.filename, "filename", errors);
  const pdfUrl = text(payload?.pdfUrl, "pdfUrl", errors) ?? text(payload?.pdf_url, "pdf_url", errors);
  if (!filename && !pdfUrl) errors.push("El PDF del procedimiento es obligatorio.");
  else if (pdfUrl && !pdfUrl.startsWith("https://")) errors.push("El PDF debe publicarse en una URL https.");
  const video = text(payload?.youtubeVideoId, "youtubeVideoId", errors) ?? text(payload?.youtube_video_id, "youtube_video_id", errors);
  if (video && !parseYoutubeId(video)) errors.push("El link de YouTube no es valido.");
  return errors;
}

export function normalizeProcedure(value: unknown): NormalizedProcedure {
  const payload = record(value) ?? {};
  const youtube = text(payload.youtubeVideoId) ?? text(payload.youtube_video_id);
  return {
    title: text(payload.title), code: text(payload.code), area: text(payload.area),
    description: text(payload.description) ?? "", youtubeVideoId: parseYoutubeId(youtube),
    filename: text(payload.filename), pdfUrl: text(payload.pdfUrl) ?? text(payload.pdf_url),
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown, field?: string, errors?: string[]): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") { if (field && errors) errors.push(`El campo ${field} debe ser texto.`); return null; }
  return value.trim() || null;
}

function validateLength(errors: string[], field: string, value: string | null, limit: number): void {
  if (value && value.length > limit) errors.push(`El campo ${field} no puede superar ${limit} caracteres.`);
}
