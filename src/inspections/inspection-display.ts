export const INFERRED_INSPECTION_YEAR = 2026;

export function formatInspectionDate(value: string | null | undefined): string {
  if (!value?.trim()) return "Fecha pendiente";
  const candidate = value.trim();
  const iso = candidate.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const complete = candidate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/u);
  if (complete) return `${pad(complete[1])}/${pad(complete[2])}/${complete[3]}`;
  const partial = candidate.match(/^(\d{1,2})[./-](\d{1,2})$/u);
  if (partial) return `${pad(partial[1])}/${pad(partial[2])}/${INFERRED_INSPECTION_YEAR}`;
  return candidate;
}

export function inspectionDateTime(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const candidate = value.trim();
  const iso = candidate.match(/^(\d{4})-(\d{2})-(\d{2})$/u);
  if (iso) return candidate;
  const complete = candidate.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/u);
  if (complete) return `${complete[3]}-${pad(complete[2])}-${pad(complete[1])}`;
  const partial = candidate.match(/^(\d{1,2})[./-](\d{1,2})$/u);
  return partial ? `${INFERRED_INSPECTION_YEAR}-${pad(partial[2])}-${pad(partial[1])}` : undefined;
}

export function inspectionDateHasInferredYear(value: string | null | undefined): boolean {
  return Boolean(value?.trim().match(/^\d{1,2}[./-]\d{1,2}$/u));
}

export function displayAuditor(value: string | null | undefined): string {
  return value?.trim() || "Auditor no informado";
}

function pad(value: string): string {
  return value.padStart(2, "0");
}

export function formatInspectionPercentage(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${value.toFixed(2)}%`;
}
