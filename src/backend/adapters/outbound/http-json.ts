import { BackendAdapterError, failureForStatus } from "./http-errors";
import {
  BACKEND_CONTRACT_HEADER,
  BACKEND_CONTRACT_VERSION,
  BACKEND_CONTRACT_VERSION_HEADER,
} from "../../domain/backend-contract";
import type { HttpClientOptions } from "./http-json-contract";

export type { HttpClientOptions } from "./http-json-contract";

export function withDefaultScope(options: HttpClientOptions): HttpClientOptions {
  return { ...options, scope: options.scope ?? "official" };
}

export function joinEndpoint(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function requestJson<T>(
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
  parse: (value: unknown) => T,
  options: HttpClientOptions = {},
): Promise<T> {
  const response = await requestResponse(fetcher, url, init, options);
  if (!response.ok) {
    throw new BackendAdapterError(
      failureForStatus(response.status),
      "Backend request was rejected.",
      response.status,
    );
  }
  return parseJsonResponse(response, parse);
}

export async function requestResponse(
  fetcher: typeof fetch,
  url: string,
  init: RequestInit,
  options: HttpClientOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 10_000;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const headers = new Headers(init.headers);
  headers.set("accept", headers.get("accept") ?? "application/json");
  headers.set(BACKEND_CONTRACT_HEADER, options.contractVersion ?? BACKEND_CONTRACT_VERSION);
  headers.set(BACKEND_CONTRACT_VERSION_HEADER, options.contractVersion ?? BACKEND_CONTRACT_VERSION);
  if (options.internalToken) headers.set("X-Fasapi-Internal-Token", options.internalToken);
  if (options.scope) headers.set("X-Fasapi-Scope", options.scope);
  try {
    const response = await fetcher(url, { ...init, headers, signal: init.signal ?? controller.signal });
    if (response.ok && options.requiredScope && response.headers.get("X-Fasapi-Scope") !== options.requiredScope) {
      throw new BackendAdapterError("FAILED_DEPENDENCY", "El backend no confirmó el scope solicitado.", 424);
    }
    return response;
  } catch (error) {
    if (error instanceof BackendAdapterError) throw error;
    if (timedOut || error instanceof Error && error.name === "AbortError") {
      throw new BackendAdapterError("TIMEOUT", "Backend request timed out.");
    }
    throw new BackendAdapterError("UNAVAILABLE", "Backend request failed.");
  } finally {
    clearTimeout(timer);
  }
}

export async function parseJsonResponse<T>(
  response: Response,
  parse: (value: unknown) => T,
): Promise<T> {
  try {
    return parse(await response.json());
  } catch {
    throw new BackendAdapterError("INVALID_RESPONSE", "Backend response did not match its contract.", response.status);
  }
}
