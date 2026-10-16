export type DocumentExtractionErrorCode =
  | "EMPTY"
  | "INVALID_FILENAME"
  | "INVALID_LIMIT"
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_REJECTED"
  | "INVALID_RESPONSE"
  | "TOO_LARGE";

const messages: Record<DocumentExtractionErrorCode, string> = {
  EMPTY: "El documento está vacío.",
  INVALID_FILENAME: "El nombre del documento no es válido.",
  INVALID_LIMIT: "El límite del documento no es válido.",
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
