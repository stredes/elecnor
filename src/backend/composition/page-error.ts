import { BackendAdapterError } from "../adapters/outbound/http-errors";

export function pageBackendError(error: unknown, resource: string): string {
  if (error instanceof BackendAdapterError && error.code === "CONFIGURATION") {
    return `Configuración incompleta para ${resource}.`;
  }
  if (error instanceof BackendAdapterError && error.code === "INVALID_RESPONSE") {
    return `El backend devolvió un contrato inválido para ${resource}.`;
  }
  if (error instanceof BackendAdapterError && error.code === "REJECTED") {
    return `El backend rechazó la consulta de ${resource}.`;
  }
  if (error instanceof BackendAdapterError && error.code === "TIMEOUT") {
    return `El backend agotó el tiempo de respuesta para ${resource}.`;
  }
  return `No se pudo cargar ${resource} desde el backend.`;
}
