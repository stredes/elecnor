import { BackendAdapterError } from "../outbound/http-errors";
import type { BackendErrorResult } from "./backend-error-response-contract";

export type { BackendErrorBody, BackendErrorResult } from "./backend-error-response-contract";

export function mapBackendError(error: unknown): BackendErrorResult {
  const code = error instanceof BackendAdapterError ? error.code : "UNAVAILABLE";
  if (code === "CONFIGURATION") return { status: 503, body: { code: "BACKEND_CONFIGURATION", error: "El backend no está configurado." } };
  if (code === "INVALID_RESPONSE") return { status: 502, body: { code: "BACKEND_INVALID_RESPONSE", error: "El backend devolvió un contrato inválido." } };
  if (code === "CONFLICT") return { status: 409, body: { code: "BACKEND_CONFLICT", error: "La solicitud entra en conflicto con el estado del backend." } };
  if (code === "FAILED_DEPENDENCY") return { status: 424, body: { code: "BACKEND_FAILED_DEPENDENCY", error: "El backend no pudo completar una dependencia." } };
  if (code === "NOT_FOUND") return { status: 404, body: { code: "BACKEND_NOT_FOUND", error: "El recurso no existe." } };
  if (code === "REJECTED") return { status: 502, body: { code: "BACKEND_REJECTED", error: "El backend rechazó la solicitud." } };
  if (code === "TIMEOUT") return { status: 504, body: { code: "BACKEND_TIMEOUT", error: "El backend agotó el tiempo de respuesta." } };
  const status = error instanceof BackendAdapterError && error.status === 502 ? 502 : 503;
  return { status, body: { code: "BACKEND_UNAVAILABLE", error: "El backend no está disponible." } };
}
