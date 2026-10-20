import type { BackendPaths } from "./backend-paths-contract";

export type { BackendPaths } from "./backend-paths-contract";

export function resolveBackendPaths(env: NodeJS.ProcessEnv): BackendPaths {
  return {
    dashboard: path(env.BACKEND_DASHBOARD_PATH, "/api/v1/dashboard"),
    inspections: path(env.BACKEND_INSPECTIONS_PATH, "/api/v1/inspections"),
    import: path(env.FASTAPI_IMPORT_PATH ?? env.BACKEND_IMPORT_PATH, "/api/v1/import"),
    extract: path(env.FASTAPI_EXTRACT_PATH, "/api/v1/pdf/extract"),
    metrics: path(env.BACKEND_METRICS_PATH, "/api/v1/metrics"),
    unknowns: path(env.BACKEND_UNKNOWNS_PATH, "/api/v1/unknown-metrics"),
    findings: path(env.BACKEND_FINDINGS_PATH, "/api/v1/findings"),
    logs: path(env.BACKEND_LOGS_PATH, "/api/v1/logs"),
    analytics: path(env.BACKEND_ANALYTICS_PATH, "/api/v1/analytics"),
    procedures: path(env.BACKEND_PROCEDURES_PATH, "/api/v1/procedures"),
    technicians: path(env.BACKEND_TECHNICIANS_PATH, "/api/v1/technicians"),
    excel: path(env.BACKEND_EXCEL_PATH, "/api/v1/export/excel"),
    driveSync: path(env.BACKEND_DRIVE_SYNC_PATH, "/api/v1/sync/drive"),
    driveSyncStatus: path(env.BACKEND_DRIVE_SYNC_STATUS_PATH, "/api/v1/sync/drive/{id}"),
    driveSyncRetry: path(env.BACKEND_DRIVE_SYNC_RETRY_PATH, "/api/v1/sync/drive/{id}/retry"),
    inspectionDownload: path(env.BACKEND_INSPECTION_DOWNLOAD_PATH, "/api/v1/inspections/{id}/download"),
    documentDownload: path(env.BACKEND_DOCUMENT_DOWNLOAD_PATH, "/api/v1/documents/{id}/download"),
  };
}

function path(value: string | undefined, fallback: string): string {
  const candidate = value?.trim();
  return candidate ? `/${candidate.replace(/^\/+/, "")}` : fallback;
}
