export const MAX_IMPORT_FILES = 20;
export const MAX_IMPORT_FILE_BYTES = 15 * 1024 * 1024;
export const MAX_IMPORT_FILE_LABEL = "15 MB";

export type ImportFile = {
  readonly name: string;
  readonly size: number;
};

export type ImportSelectionErrorCode =
  | "EMPTY_SELECTION"
  | "TOO_MANY_FILES"
  | "INVALID_EXTENSION"
  | "FILE_TOO_LARGE";

export class ImportSelectionError extends Error {
  public constructor(
    public readonly code: ImportSelectionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ImportSelectionError";
  }
}

export function validateImportFiles(files: readonly ImportFile[]): void {
  if (files.length === 0) {
    throw new ImportSelectionError("EMPTY_SELECTION", "Selecciona al menos un PDF.");
  }
  if (files.length > MAX_IMPORT_FILES) {
    throw new ImportSelectionError(
      "TOO_MANY_FILES",
      `Máximo ${MAX_IMPORT_FILES} archivos por importación.`,
    );
  }
  for (const file of files) validateFile(file);
}

function validateFile(file: ImportFile): void {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new ImportSelectionError(
      "INVALID_EXTENSION",
      `Solo se permiten archivos PDF: ${file.name}`,
    );
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new ImportSelectionError(
      "FILE_TOO_LARGE",
      `El archivo ${file.name} supera el tamaño máximo de ${MAX_IMPORT_FILE_LABEL}.`,
    );
  }
}
