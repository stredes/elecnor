import { validateImportFiles, type ImportFile } from "@/backend/domain/import-files";
import type { LegacyImportFeedback } from "../contracts/legacy-import-feedback-contract";
export type { LegacyImportFeedback } from "../contracts/legacy-import-feedback-contract";

export function validateLegacyPdfSelection(files: readonly { name: string; size: number }[]): string | null {
  try {
    validateImportFiles(files.map(({ name, size }): ImportFile => ({ name, size })));
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "La selección de PDFs no es válida.";
  }
}

export function describeLegacyImport(value: unknown): LegacyImportFeedback {
  const payload = value as Record<string, unknown>;
  const nuevas = counter(payload.inspecciones_nuevas);
  const duplicados = counter(payload.duplicados);
  const errores = counter(payload.errores);
  const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
  const parts = [plural(nuevas, "inspección nueva", "inspecciones nuevas"), plural(duplicados, "duplicado", "duplicados")];
  if (errores) parts.push(plural(errores, "error", "errores"));
  return { kind: errores ? "error" : "ok", text: `Importación finalizada: ${parts.join(" · ")}.`, refresh: nuevas > 0 };
}

function counter(value: unknown): number { return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0; }
