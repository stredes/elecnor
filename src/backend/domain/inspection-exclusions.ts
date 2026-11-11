/**
 * Read-only portal exclusions for source records that are not Elecnor prevention inspections.
 * The call-center PDF remains in the backend for traceability but is omitted from portal read models.
 */
export const CALL_CENTER_INSPECTION_ID = "AUD-4A4789008B95";
export const CALL_CENTER_IMPORT_LOG_ID = "LOG-D24D380977C4";
export const EXCLUDED_INSPECTION_COUNT = 1;

export function isExcludedInspection(id: string | null | undefined): boolean {
  return id === CALL_CENTER_INSPECTION_ID;
}

export function isExcludedImportLog(id: string): boolean {
  return id === CALL_CENTER_IMPORT_LOG_ID;
}
