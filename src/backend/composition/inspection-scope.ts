import type { HttpClientOptions } from "../adapters/outbound/http-json-contract";
import { DEFAULT_INSPECTION_SCOPE, type InspectionScope } from "../domain/inspection-scope";

export function resolveInspectionScope(env: NodeJS.ProcessEnv = process.env): InspectionScope {
  return parseScope(env.BACKEND_INSPECTIONS_SCOPE);
}

export function inspectionScopeOptions(
  options: HttpClientOptions,
  scope: InspectionScope,
): HttpClientOptions {
  return { ...options, scope, requiredScope: scope === "official" ? scope : undefined };
}

function parseScope(value: string | undefined): InspectionScope {
  const candidate = value?.trim().toLowerCase();
  return candidate === "all" ? "all" : DEFAULT_INSPECTION_SCOPE;
}
