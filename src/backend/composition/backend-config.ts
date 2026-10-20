import { BackendConfigurationError } from "../adapters/outbound/http-errors";
import {
  BACKEND_CONTRACT_VERSION,
  BACKEND_CONTRACT_HEADER,
  DRIVE_CONTRACT_VERSION,
} from "../domain/backend-contract";
import { resolveBackendPaths } from "./backend-paths";
import type { BackendPaths } from "./backend-paths-contract";
import type { BackendSelection } from "./backend-config-contract";
export { BACKEND_CONTRACT_HEADER as FASAPI_CONTRACT_HEADER };
export { BACKEND_CONTRACT_VERSION as FASAPI_CONTRACT_VERSION };
export { DRIVE_CONTRACT_VERSION as FASAPI_DRIVE_CONTRACT_VERSION };
export type { BackendPaths } from "./backend-paths";
export type { BackendMode, BackendSelection } from "./backend-config-contract";

export function resolveBackendSelection(env: NodeJS.ProcessEnv = process.env): BackendSelection {
  const paths = resolveBackendPaths(env);
  const timeoutMs = resolveTimeout(env);
  const url = baseUrl(env.FASTAPI_API_URL ?? env.BACKEND_API_URL);
  const internalToken = token(env.FASTAPI_INTERNAL_TOKEN ?? env.BACKEND_INTERNAL_TOKEN);
  const requested = env.BACKEND_API_MODE?.trim().toLowerCase();
  if (!timeoutMs) return unavailable(paths, "BACKEND_TIMEOUT_MS debe ser un entero entre 100 y 120000.");
  if (requested && requested !== "http" && requested !== "memory") return unavailable(paths, "BACKEND_API_MODE debe ser http o memory.", timeoutMs);
  if (requested === "memory") return memoryOrUnavailable(paths, url, env, timeoutMs);
  if (requested === "http") return url ? selection(url, paths, env, timeoutMs, internalToken) : unavailable(paths, "FASTAPI_API_URL o BACKEND_API_URL es obligatorio con BACKEND_API_MODE=http.", timeoutMs);
  if (url) return selection(url, paths, env, timeoutMs, internalToken);
  return developmentFallback(paths, env, timeoutMs);
}

export function resolveImportSelection(env: NodeJS.ProcessEnv = process.env): BackendSelection {
  const paths = resolveBackendPaths(env);
  const timeoutMs = resolveTimeout(env);
  const url = baseUrl(env.FASTAPI_API_URL ?? env.BACKEND_API_URL);
  const internalToken = token(env.FASTAPI_INTERNAL_TOKEN ?? env.BACKEND_INTERNAL_TOKEN);
  const requested = env.BACKEND_API_MODE?.trim().toLowerCase();
  if (!timeoutMs) return unavailable(paths, "BACKEND_TIMEOUT_MS debe ser un entero entre 100 y 120000.");
  if (requested && requested !== "http" && requested !== "memory") return unavailable(paths, "BACKEND_API_MODE debe ser http o memory.", timeoutMs);
  if (requested === "memory") return memoryOrUnavailable(paths, url, env, timeoutMs);
  if (requested === "http") return url ? selection(url, paths, env, timeoutMs, internalToken) : unavailable(paths, "FASTAPI_API_URL o BACKEND_API_URL es obligatorio para importación.", timeoutMs);
  if (url) return selection(url, paths, env, timeoutMs, internalToken);
  return developmentFallback(paths, env, timeoutMs);
}

function developmentFallback(paths: BackendPaths, env: NodeJS.ProcessEnv, timeoutMs: number): BackendSelection {
  const allowed = env.NODE_ENV !== "production" && (env.NODE_ENV === "test" || env.BACKEND_USE_SYNTHETIC_DATA === "true");
  return allowed
    ? { mode: "memory", url: null, paths, contractVersion: BACKEND_CONTRACT_VERSION, driveContractVersion: DRIVE_CONTRACT_VERSION, internalToken: null, timeoutMs, ...flags(env) }
    : unavailable(paths, "Configura BACKEND_API_URL; los datos sintéticos sólo están permitidos fuera de producción.", timeoutMs);
}

function memoryOrUnavailable(paths: BackendPaths, url: string | null, env: NodeJS.ProcessEnv, timeoutMs: number): BackendSelection {
  return env.NODE_ENV === "production"
    ? unavailable(paths, "Los adaptadores de memoria están bloqueados en producción.", timeoutMs)
    : { mode: "memory", url, paths, contractVersion: BACKEND_CONTRACT_VERSION, driveContractVersion: DRIVE_CONTRACT_VERSION, internalToken: null, timeoutMs, ...flags(env) };
}

function unavailable(paths: BackendPaths, message: string, timeoutMs = 10_000): BackendSelection {
  return { mode: "unavailable", url: null, paths, contractVersion: BACKEND_CONTRACT_VERSION, driveContractVersion: DRIVE_CONTRACT_VERSION, internalToken: null, timeoutMs, driveSyncStateEnabled: false, documentDownloadEnabled: false, error: new BackendConfigurationError(message) };
}

function selection(url: string, paths: BackendPaths, env: NodeJS.ProcessEnv, timeoutMs: number, internalToken: string | null): BackendSelection {
  return { mode: "http", url, paths, contractVersion: env.FASTAPI_CONTRACT_VERSION?.trim() || BACKEND_CONTRACT_VERSION, driveContractVersion: env.FASTAPI_DRIVE_CONTRACT_VERSION?.trim() || DRIVE_CONTRACT_VERSION, internalToken, timeoutMs, ...flags(env) };
}

function flags(env: NodeJS.ProcessEnv) {
  return {
    driveSyncStateEnabled: env.BACKEND_DRIVE_SYNC_STATE_ENABLED === "true",
    documentDownloadEnabled: env.BACKEND_DOCUMENT_DOWNLOAD_ENABLED === "true",
  };
}

function token(value: string | undefined): string | null {
  const candidate = value?.trim();
  return candidate ? candidate : null;
}

function baseUrl(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;
  try {
    const parsed = new URL(candidate);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    return candidate.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

function resolveTimeout(env: NodeJS.ProcessEnv): number | null {
  const raw = env.FASTAPI_TIMEOUT_MS ?? env.BACKEND_TIMEOUT_MS;
  if (!raw) return 10_000;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 100 && value <= 120_000 ? value : null;
}
