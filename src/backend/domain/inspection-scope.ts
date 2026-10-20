export const INSPECTION_SCOPES = ["official", "all"] as const;

export type InspectionScope = (typeof INSPECTION_SCOPES)[number];

export const DEFAULT_INSPECTION_SCOPE: InspectionScope = "official";

const SCOPE_SET = new Set<string>(INSPECTION_SCOPES);

export function parseInspectionScope(value: string | undefined): InspectionScope {
  const candidate = value?.trim().toLowerCase() ?? "";
  return SCOPE_SET.has(candidate) ? candidate as InspectionScope : DEFAULT_INSPECTION_SCOPE;
}

export function isOfficial(scope: InspectionScope): boolean {
  return scope === "official";
}
