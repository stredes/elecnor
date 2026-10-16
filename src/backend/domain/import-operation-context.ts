export type ImportContextInput = {
  readonly requestId: string;
  readonly cancellation: { isCancelled(): boolean };
};

export class ImportContextError extends Error {
  public constructor() {
    super("El contexto de importación no es válido.");
    this.name = "ImportContextError";
  }
}

export function validateImportContext(context: ImportContextInput): void {
  if (!context.requestId.trim()) throw new ImportContextError();
}
