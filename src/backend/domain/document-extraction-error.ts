export type DocumentExtractionErrorCode =
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_REJECTED"
  | "INVALID_RESPONSE"
  | "TOO_LARGE";

const messages: Record<DocumentExtractionErrorCode, string> = {
  UPSTREAM_UNAVAILABLE: "El servicio documental no está disponible.",
  UPSTREAM_REJECTED: "El documento fue rechazado por el servicio documental.",
  INVALID_RESPONSE: "El servicio documental devolvió una respuesta inválida.",
  TOO_LARGE: "El documento supera el límite configurado.",
};

export class DocumentExtractionError extends Error {
  public readonly code: DocumentExtractionErrorCode;
  public readonly status: number | null;

  public constructor(code: DocumentExtractionErrorCode, status: number | null = null) {
    super(messages[code]);
    this.name = "DocumentExtractionError";
    this.code = code;
    this.status = status;
  }
}
