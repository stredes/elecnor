import { ImportSelectionError } from "@/backend/domain/import-files";
import { ImportGatewayError } from "@/backend/ports/import-gateway";

export type ImportErrorResponse = {
  readonly status: 400 | 502 | 503;
  readonly body: { readonly error: string };
};

const UNAVAILABLE = "El servicio de importación no está disponible.";
const REJECTED = "El servicio de importación rechazó la solicitud.";

export function mapImportError(error: unknown): ImportErrorResponse {
  if (error instanceof ImportSelectionError) {
    return { status: 400, body: { error: error.message } };
  }
  if (error instanceof ImportGatewayError && error.code === "REJECTED") {
    return { status: 502, body: { error: REJECTED } };
  }
  return { status: 503, body: { error: UNAVAILABLE } };
}
