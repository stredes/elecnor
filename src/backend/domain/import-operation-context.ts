export type ImportContextInput = { readonly requestId: string };

export class ImportContextError extends Error {
  public constructor() {
    super("El contexto de importación no es válido.");
    this.name = "ImportContextError";
  }
}

export function validateImportContext(context: ImportContextInput): void {
  if (!context.requestId.trim()) throw new ImportContextError();
}
