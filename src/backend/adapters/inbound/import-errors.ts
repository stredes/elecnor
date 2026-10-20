import { ImportSelectionError } from "@/backend/domain/import-files";
import { ImportFormError } from "@/backend/adapters/inbound/import-form";
import { ImportGatewayError } from "@/backend/ports/import-gateway";
import type { ImportErrorResponse } from "./import-errors-contract";

const UNAVAILABLE = "El servicio de importación no está disponible.";
const REJECTED = "El servicio de importación rechazó la solicitud.";

export function mapImportError(error: unknown): ImportErrorResponse {
  if (error instanceof ImportSelectionError || error instanceof ImportFormError) {
    return { status: 400, body: { error: error.message } };
  }
  if (error instanceof ImportGatewayError && error.code === "REJECTED") {
    const status = error.status === 409 || error.status === 424 || error.status === 502 ? error.status : 502;
    return { status, body: { error: REJECTED } };
  }
  return { status: 503, body: { error: UNAVAILABLE } };
}
